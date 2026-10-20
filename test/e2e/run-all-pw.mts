import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { exitWithError } from '../../development/lib/exit-with-error.js';
import { runInShell } from '../../development/lib/run-command.js';
import {
  getTestPathsForTestDir,
  runningOnGitHubActions,
} from './run-all-shared.mts';

/**
 * Playwright runner sharing the Selenium runner's CI shard selection.
 * Local runs execute all discovered specs or the supplied spec filters.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_BY_BROWSER = {
  chrome: 'chrome-e2e',
  firefox: 'firefox-e2e',
} as const;

type Browser = keyof typeof PROJECT_BY_BROWSER;

/**
 * Runs a single Playwright invocation for the given specs. When `outputFile` is
 * provided it's exported as `PLAYWRIGHT_JUNIT_OUTPUT_FILE`; the mocha-compatible
 * reporter treats it as a base name and writes one XML file per spec
 * (`<base>-<specHash>.xml`) so re-run merging stays correct.
 *
 * @param options - Invocation options.
 * @param options.specs - Repo-relative spec paths to run.
 * @param options.project - Playwright project name (`chrome-e2e` / `firefox-e2e`).
 * @param options.extraArgs - Additional Playwright CLI args.
 * @param options.outputFile - JUnit output base path for this invocation, if any.
 */
async function runPlaywright({
  specs,
  project,
  extraArgs = [],
  outputFile,
}: {
  specs: string[];
  project: string;
  extraArgs?: string[];
  outputFile?: string;
}): Promise<void> {
  if (specs.length === 0) {
    return;
  }

  if (outputFile) {
    process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE = outputFile;
  } else {
    delete process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE;
  }

  const args = [
    'playwright',
    'test',
    `--project=${project}`,
    ...extraArgs,
    ...specs,
  ];

  await runInShell('yarn', args);
}

async function main(): Promise<void> {
  const { argv } = yargs(hideBin(process.argv))
    .usage(
      '$0 [specs..]',
      'Run migrated Playwright (*.pw.spec.ts) E2E tests with CI shard splitting.',
      (_yargs) =>
        _yargs
          .option('browser', {
            description: `Set the browser used; either 'chrome' or 'firefox'.`,
            type: 'string',
            choices: ['chrome', 'firefox'] as const,
            demandOption: true,
          })
          .option('retries', {
            description: 'Playwright retries per test.',
            type: 'number',
          })
          .positional('specs', {
            description:
              'Optional spec path filters. When provided, only these run (local use).',
            type: 'string',
            array: true,
          }),
    )
    .strict()
    .help('help');

  const { browser, retries, specs } = argv as unknown as {
    browser: Browser;
    retries?: number;
    specs?: string[];
  };

  const project = PROJECT_BY_BROWSER[browser];
  // Keep the timing-split + JUnit defaults aligned with the rest of the e2e
  // tooling, which keys off SELENIUM_BROWSER.
  process.env.SELENIUM_BROWSER = browser;
  if (browser === 'firefox') {
    process.env.PLAYWRIGHT_BROWSER = 'firefox';
  }

  const fullTestList = await getTestPathsForTestDir(
    path.join(__dirname, 'tests'),
    { playwright: true },
  );

  await fs.promises.mkdir('test/test-results/e2e', { recursive: true });

  const normalArgs = retries === undefined ? [] : [`--retries=${retries}`];

  // Local invocation (or explicit spec filters): one Playwright run, no split.
  // Spec filters are forwarded verbatim — Playwright matches them as path
  // substrings, so both full paths and bare filenames work.
  if (!process.env.GITHUB_ACTION) {
    const specsToRun = specs && specs.length > 0 ? specs : fullTestList;
    await runPlaywright({ specs: specsToRun, project, extraArgs: normalArgs });
    return;
  }

  const { myTestList } = await runningOnGitHubActions(fullTestList);
  if (myTestList.length === 0) {
    console.log('No tests to run, exiting successfully.');
    return;
  }
  const matrixIndex = parseInt(process.env.MATRIX_INDEX || '0', 10);
  await runPlaywright({
    specs: myTestList,
    project,
    extraArgs: normalArgs,
    outputFile: `test/test-results/e2e/junit-pw-${browser}-${matrixIndex + 1}.xml`,
  });
}

main().catch((error) => {
  exitWithError(error);
});
