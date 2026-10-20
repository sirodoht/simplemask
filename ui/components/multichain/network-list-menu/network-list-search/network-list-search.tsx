import React from 'react';

import { TextFieldSearch } from '@metamask/design-system-react';
import { getText } from '../../../../helpers/utils/text';
import { Box } from '../../../component-library';

const NetworkListSearch = ({
  searchQuery,
  setSearchQuery,
  setFocusSearch,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFocusSearch: (val: boolean) => void;
}) => {
  const t = getText;

  return (
    <Box paddingLeft={4} paddingRight={4} paddingBottom={2} paddingTop={0}>
      <TextFieldSearch
        autoFocus
        className="w-full"
        clearButtonOnClick={() => setSearchQuery('')}
        data-testid="search-list"
        onBlur={() => setFocusSearch(false)}
        onFocus={() => setFocusSearch(true)}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={t('search')}
        value={searchQuery}
      />
    </Box>
  );
};

export default NetworkListSearch;
