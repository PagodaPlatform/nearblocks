/**
 * Component: AddressNFTTransactions
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: NFT Transactions of address on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [handleFilter] - Function to handle filter changes. (Optional)
 *                                    Example: handleFilter={handlePageFilter} where handlePageFilter is a function to filter the page.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                   Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string, options?: { count?: string }) => string;
  id: string;
  filters: { [key: string]: string };
  handleFilter: (name: string, value: string) => void;
  onFilterClear: (name: string) => void;
}

import TxnStatus from '@/includes/Common/Status';
import Filter from '@/includes/Common/Filter';
import { TransactionInfo } from '@/includes/types';
import SortIcon from '@/includes/icons/SortIcon';
import CloseCircle from '@/includes/icons/CloseCircle';
import Skeleton from '@/includes/Common/Skeleton';
import Clock from '@/includes/icons/Clock';
import TokenImage from '@/includes/icons/TokenImage';
import Download from '@/includes/icons/Download';

export default function (props: Props) {
  const { network, t, id, filters, handleFilter, onFilterClear, ownerId } =
    props;
  const {
    localFormat,
    getTimeAgoString,
    formatTimestampToString,
    capitalizeFirstLetter,
  } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli, truncateString } =
    VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const [showAge, setShowAge] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [address, setAddress] = useState('');
  const [filterValue, setFilterValue] = useState<Record<string, string>>({});

  const [sorting, setSorting] = useState('desc');
  const errorMessage = t ? t('txns:noTxns') : ' No transactions found!';

  const config = getConfig && getConfig(network);

  const toggleShowAge = () => setShowAge((s) => !s);
  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    function fetchTotalTxns(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/nft-txns/count?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(
          (data: {
            body: {
              txns: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, () => fetchTotalTxns(qs));
            }
          },
        )
        .catch(() => {});
    }

    function fetchTxnsData(qs: string, sqs: string, page: number) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/nft-txns?${queryParams}order=${sqs}&page=${page}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { txns: TransactionInfo[] }; status: number }) => {
          const resp = data?.body?.txns;
          if (data.status === 200) {
            if (Array.isArray(resp) && resp.length > 0) {
              setTxns((prevData) => ({ ...prevData, [page]: resp || [] }));
            } else if (resp.length === 0) {
              setTxns({});
            }
            setIsLoading(false);
          } else {
            handleRateLimit(
              data,
              () => fetchTxnsData(qs, sorting, page),
              () => setIsLoading(false),
            );
          }
        })
        .catch(() => {});
    }
    let urlString = '';
    if (filters && Object.keys(filters).length > 0) {
      urlString = Object.keys(filters)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`,
        )
        .join('&');
    }

    if (urlString && sorting) {
      fetchTotalTxns(urlString);
      fetchTxnsData(urlString, sorting, currentPage);
    } else if (sorting && (!filters || Object.keys(filters).length === 0)) {
      fetchTotalTxns();
      fetchTxnsData('', sorting, currentPage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, currentPage, filters, sorting]);

  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ): void => {
    setFilterValue((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const onFilter = (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string,
  ): void => {
    e.preventDefault();

    if (filterValue[name] !== undefined && filterValue[name] !== null) {
      handleFilter(name, filterValue[name]);
    }
  };

  const onClear = (name: string) => {
    if (onFilterClear && filters) {
      onFilterClear(name);
      setFilterValue((prevFilters) => ({
        ...prevFilters,
        [name]: '',
      }));
    }
  };

  const onOrder = () => {
    setSorting((state) => (state === 'asc' ? 'desc' : 'asc'));
  };

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };
  const columns = [
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName: 'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      header: <>{t ? t('txns:hash') : 'TXN HASH'}</>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap">
                  <Link
                    href={`/txns/${row?.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 font-medium hover:no-underline">
                      {row?.transaction_hash}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                align="start"
                side="bottom"
              >
                {row?.transaction_hash}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 ',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600  uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              {t ? t('txns:type') : 'METHOD'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="z-50 bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <div className="flex flex-col">
              <input
                name="event"
                value={filterValue['event']}
                onChange={(e) => onInputChange(e, 'event')}
                placeholder="Search by method"
                className="border rounded h-8 mb-2 px-2 text-nearblue-600  text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  onClick={(e) => onFilter(e, 'event')}
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={() => onClear('event')}
                  className="flex-1 rounded bg-gray-300 text-xs h-7"
                >
                  {t ? t('txns:filter.clear') : 'Clear'}
                </button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-nearblue-600  rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">{row?.cause}</span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row?.cause}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 ',
    },
    {
      header: <>Affected</>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span
                    className={`inline-block align-bottom text-green-500 whitespace-nowrap ${
                      row?.affected_account_id === address
                        ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                        : 'text-green-500 p-0.5 px-1'
                    }`}
                  >
                    <Link
                      href={`/address/${row?.affected_account_id}`}
                      className="hover:no-underline"
                    >
                      <a
                        className="text-green-500 hover:no-underline"
                        onMouseOver={(e) =>
                          onHandleMouseOver(e, row?.affected_account_id)
                        }
                        onMouseLeave={handleMouseLeave}
                      >
                        {truncateString(row?.affected_account_id, 15, '...')}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row?.affected_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </>
      ),
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600  uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          {row.involved_account_id === row.affected_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 text-white text-xs font-semibold">
              {t ? t('txns:txnSelf') : 'SELF'}
            </span>
          ) : Number(row?.delta_amount) < 0 ? (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 text-yellow-700 text-xs font-semibold">
              {t ? t('txns:txnOut') : 'OUT'}
            </span>
          ) : (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen text-white text-xs font-semibold">
              {t ? t('txns:txnIn') : 'IN'}
            </span>
          )}
        </>
      ),
      tdClassName: 'text-center',
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              Involved
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="involved"
              value={filterValue['involved']}
              onChange={(e) => onInputChange(e, 'involved')}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-nearblue-600  text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'involved')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                {t ? t('txns:filter.filter') : 'Filter'}
              </button>
              <button
                name="involved"
                type="button"
                onClick={() => onClear('involved')}
                className="flex-1 rounded bg-gray-300 text-xs h-7"
              >
                {t ? t('txns:filter.clear') : 'Clear'}
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => (
        <>
          {row.involved_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Link
                      href={`/address/${row.involved_account_id}`}
                      className="hover:no-underline truncate inline-block"
                    >
                      <a
                        className={`text-green-500 hover:no-underline ${
                          row?.involved_account_id === address
                            ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-1 -m-[1px] cursor-pointer text-[#033F40]'
                            : 'text-green-500 p-1'
                        }`}
                        onMouseOver={(e) =>
                          onHandleMouseOver(e, row?.involved_account_id)
                        }
                        onMouseLeave={handleMouseLeave}
                      >
                        {truncateString(row.involved_account_id, 15, '...')}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row.involved_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600  font-medium',
    },
    {
      header: <>Token ID</>,
      key: 'token_id',
      cell: (row: TransactionInfo) => (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span>
                <Link
                  href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 font-medium hover:no-underline">
                    {row?.token_id}
                  </a>
                </Link>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              align="start"
              side="bottom"
            >
              {row?.token_id}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600  max-w-[110px] inline-block truncate',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600  uppercase tracking-wider',
    },
    {
      header: <>Token</>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row?.nft?.icon}
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                  appUrl={config.appUrl}
                />
              </span>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="text-sm text-nearblue-600  max-w-[110px] inline-block truncate whitespace-nowrap">
                      <Link
                        href={`/nft-token/${row?.nft?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 font-medium hover:no-underline">
                          {row?.nft?.name}
                        </a>
                      </Link>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="start"
                    side="bottom"
                  >
                    {row?.nft?.name}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              {row?.nft?.symbol && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate whitespace-nowrap">
                        &nbsp; {row?.nft?.symbol}
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                      align="start"
                      side="bottom"
                    >
                      {row?.nft?.symbol}
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </div>
          )
        );
      },
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 ',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600  uppercase tracking-wider',
    },
    {
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 focus:outline-none whitespace-nowrap"
                >
                  {showAge
                    ? t
                      ? t('txns:age')
                      : 'AGE'
                    : t
                    ? t('txns:ageDT')
                    : 'DATE TIME (UTC)'}
                  {showAge && <Clock className="text-green-500 ml-2" />}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="top"
              >
                {showAge
                  ? 'Click to show Datetime Format'
                  : 'Click to show Age Format'}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600  font-semibold">
              <SortIcon order={sorting} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  {!showAge
                    ? row?.block_timestamp
                      ? formatTimestampToString(
                          nanoToMilli(row?.block_timestamp),
                        )
                      : ''
                    : row?.block_timestamp
                    ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                    : ''}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {showAge
                  ? row?.block_timestamp
                    ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                    : ''
                  : row?.block_timestamp
                  ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                  : ''}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white soft-shadow rounded-xl pb-1">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 ">
              A total of {localFormat && localFormat(totalCount.toString())}{' '}
              transactions found
            </p>
          </div>
          <div className="flex flex-col px-4 text-sm mb-4 text-nearblue-600 lg:flex-row lg:ml-auto  lg:items-center lg:justify-between">
            {filters && Object.keys(filters).length > 0 && (
              <div className="flex  px-2 items-center text-sm text-gray-500 mb-2 lg:mb-0">
                <span className="mr-1 lg:mr-2">Filtered By:</span>
                <span className="flex flex-wrap items-center justify-center bg-gray-100 rounded-full px-3 py-1 space-x-2">
                  {Object.keys(filters).map((key) => (
                    <span
                      className="flex items-center max-sm:mb-1 truncate max-w-[120px]"
                      key={key}
                    >
                      {capitalizeFirstLetter(key)}:{' '}
                      <span className="font-semibold truncate">
                        {filters[key]}
                      </span>
                    </span>
                  ))}
                  <CloseCircle
                    className="w-4 h-4 fill-current cursor-pointer"
                    onClick={onClear}
                  />
                </span>
              </div>
            )}
            <span className="text-xs text-nearblue-600 self-stretch lg:self-auto px-2">
              <button className="hover:no-underline ">
                <Link
                  href={`/nft-token/exportdata?address=${id}`}
                  className="flex items-center text-nearblue-600 font-medium py-2 border border-neargray-700 px-4 rounded-md bg-white hover:bg-neargray-800"
                >
                  <p>CSV Export</p>
                  <span className="ml-2">
                    <Download />
                  </span>
                </Link>
              </button>
            </span>
          </div>
        </div>
      )}
      {
        <Widget
          src={`${ownerId}/widget/bos-components.components.Shared.Table`}
          props={{
            columns: columns,
            data: txns[currentPage],
            isLoading: isLoading,
            isPagination: true,
            count: totalCount,
            page: currentPage,
            limit: 25,
            pageLimit: 200,
            setPage: setPage,
            Error: errorMessage,
          }}
        />
      }
    </div>
  );
}
