import fs from 'fs';
import path from 'path';
import { extractTestResults } from '../../.github/scripts/extract-test-results.mts';
import {
  formatTime,
  normalizeTestPath,
} from '../../.github/scripts/shared/utils.mts';
import { splitTestsByTimings } from '../../.github/scripts/split-tests-by-timings.mts';

/**
 * CI test-selection logic shared by the Selenium E2E runner (`run-all.mts`) and
 * the Playwright E2E runner (`run-all-pw.mts`). Both runners discover their spec
 * files and decide what to run on a GitHub Actions shard in exactly the same
 * way; only the execution step differs (Mocha per file vs `playwright test`).
 */

/**
 * Recursively collects spec files under the given directory.
 *
 * @param testDir - Absolute path to the directory to scan.
 * @param options - Discovery options.
 * @param options.playwright - When `true`, collect only Playwright specs
 * (`*.pw.spec.ts`). When `false` (default), collect Selenium specs
 * (`*.spec.js` / `*.spec.ts`), excluding Playwright specs.
 * @returns Normalized, repo-relative spec paths.
 */
export async function getTestPathsForTestDir(
  testDir: string,
  { playwright = false }: { playwright?: boolean } = {},
): Promise<string[]> {
  const entries = await fs.promises.readdir(testDir, { withFileTypes: true });
  const testPaths: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(testDir, entry.name);

    if (entry.isDirectory()) {
      testPaths.push(
        ...(await getTestPathsForTestDir(fullPath, { playwright })),
      );
      continue;
    }

    const isPlaywrightSpec = fullPath.endsWith('.pw.spec.ts');
    const isSpec =
      fullPath.endsWith('.spec.js') || fullPath.endsWith('.spec.ts');

    if (playwright ? isPlaywrightSpec : isSpec && !isPlaywrightSpec) {
      testPaths.push(normalizeTestPath(fullPath));
    }
  }

  return testPaths;
}

/**
 * Split all discovered tests across CI shards, optionally rerunning failures.
 * No PR labels or organization-generated change lists affect test coverage.
 *
 * @param fullTestList - All discovered spec paths for this runner.
 * @returns The tests assigned to this shard.
 */
export async function runningOnGitHubActions(
  fullTestList: string[],
): Promise<{ myTestList: string[] }> {
  // Determine the test matrix division
  // GitHub Actions uses matrix.index (0-based) and matrix.total values for test splitting
  const matrixIndex = parseInt(process.env.MATRIX_INDEX || '0', 10);
  const matrixTotal = parseInt(process.env.MATRIX_TOTAL || '1', 10);
  const runAttempt = parseInt(process.env.RUN_ATTEMPT || '1', 10);
  const previousResultsPath = process.env.PREVIOUS_RESULTS_PATH;

  console.log(
    `GitHub Actions matrix: index ${matrixIndex} of ${matrixTotal} total jobs (attempt ${runAttempt})`,
  );

  const chunks = splitTestsByTimings(fullTestList, [], matrixTotal);

  console.log(
    `Expected chunk run time: ${formatTime(chunks[matrixIndex].time)}`,
  );

  const myOriginalTestList = chunks[matrixIndex].paths || [];

  // Check if this is a re-run with previous results available
  if (runAttempt > 1 && previousResultsPath) {
    console.log(
      'Re-run detected (attempt %d), checking for failed tests to re-run...',
      runAttempt,
    );

    const { passed, failed, executed } =
      await extractTestResults(previousResultsPath);

    // If no tests were executed in previous run, something is wrong - run all tests
    if (executed.length === 0) {
      console.log(
        'No test results found from previous run, running all tests in chunk.',
      );
      return { myTestList: myOriginalTestList };
    }

    // Re-run tests that failed OR were never executed in previous run
    // Only skip tests that explicitly passed - this ensures:
    // 1. Failed tests get re-run
    // 2. Tests that never executed (due to crash/cancel) also get run
    // 3. Only confirmed passing tests are skipped
    const testsToRerun = myOriginalTestList.filter(
      (testPath) => !passed.includes(testPath),
    );

    const failedInChunk = testsToRerun.filter((t) => failed.includes(t)).length;
    const notExecutedInChunk = testsToRerun.length - failedInChunk;
    console.log(
      `Previous run results: ${passed.length} passed, ${failed.length} failed`,
    );
    console.log(
      `This chunk: ${failedInChunk} failed, ${notExecutedInChunk} not executed`,
    );

    if (testsToRerun.length > 0) {
      console.log(
        `Re-running ${testsToRerun.length} tests (${failedInChunk} failed, ${notExecutedInChunk} not executed):`,
        testsToRerun,
      );
      return { myTestList: testsToRerun };
    }

    // No tests to re-run - all tests in this chunk passed
    console.log('All tests in this chunk passed, skipping.');
    return { myTestList: [] };
  }

  return { myTestList: myOriginalTestList };
}
