import CursorPaginator from '@/includes/Common/CursorPaginator';
import Paginator from '@/includes/Common/Paginator';
import Skeleton from '@/includes/Common/Skeleton';
/**
 * @param {boolean} isLoading - Represents the loading state of the data.
 * @param {Array} columns - An array of objects defining the columns for the table.
 * @param {Array} data - An array of rows containing data for the table.
 * @param {boolean} isPagination - Indicates if pagination is enabled for the table.
 * @param {number} count - The total count of items in the dataset.
 * @param {number} page - The current page number being displayed.
 * @param {number} limit - The number of items per page.
 * @param {string} Error - Error message if there is no data.
 * @param {number} pageLimit - The maximum number of pages to display in pagination.
 * @param {function} setPage - A function used to set the current page of the table.
 * @param {function} renderRowSubComponent - A function is used to render a sub-component for each row in the table.
 * @param {Array} expanded - An array of numbers representing the indices of rows that are expanded.
 * @param {boolean} isExpanded -  Flag for compact table display.
 * @param {boolean} cursorPagination - Indicates if cursor pagination is enabled for the table
 * @param {string} cursor - Cursor to be set when pagination is applied.
 * @param {string} apiUrl - URL used for attaching cursor during pagination.
 * @param {function} setUrl - A function used to set the URL on the current table.
 * @param {string} ownerId - The identifier of the owner of the component.
 */
interface column {
  header: string;
  key: string;
  cell?: (row: any, rowIndex?: number) => React.ReactNode;
  tdClassName: string;
  thClassName?: string;
}

interface Props {
  isLoading?: boolean;
  columns: column[];
  data: any[];
  isPagination: boolean;
  count: number;
  page: number;
  limit: number;
  pageLimit: number;
  setPage: (page: number) => void;
  renderRowSubComponent: (row: any, rowIndex?: number) => React.ReactNode;
  expanded: number[];
  isExpanded: false;
  Error: string | any;
  cursorPagination: boolean;
  cursor: string;
  apiUrl: string;
  setUrl: (url: string) => void;
  ownerId: string;
}

export default function (props: Props) {
  if (props.isLoading) {
    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
            <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
              <tr>
                {props.columns.map((column, index) => (
                  <th key={index} scope="col" className={column.thClassName}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
              {[...Array(props.limit)].map((_, index) => (
                <tr key={index} className=" hover:bg-blue-900/5 h-[57px]">
                  {props.columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.tdClassName}>
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {props.isPagination ? (
          <Paginator
            count={props.count}
            page={props.page}
            isLoading={props.isLoading}
            limit={props.limit}
            pageLimit={props.pageLimit}
            setPage={props.setPage}
          />
        ) : null}
        {props.cursorPagination ? (
          <CursorPaginator
            apiUrl={props.apiUrl}
            count={props.count}
            limit={props.limit}
            setUrl={props.setUrl}
            cursor={props.cursor}
            isLoading={props.isLoading}
            ownerId={props.ownerId}
          />
        ) : null}
      </>
    );
  }
  return (
    <>
      {props.isExpanded ? (
        <div className={`bg-gray-50 dark:bg-black-600 overflow-x-auto`}>
          <table
            className={
              'min-w-full divide-y dark:divide-black-200 dark:border-black border-separate '
            }
          >
            <thead>
              <tr>
                {props?.columns.map((column: column, index: number) => (
                  <th key={index} scope="col" className={column.thClassName}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!props.isLoading && props.data === undefined && (
                <tr className="h-[57px]">
                  <td colSpan={100} className="px-6 py-4 text-gray-400 text-xs">
                    {props.Error}
                  </td>
                </tr>
              )}
              {props.data &&
                props.data.map((row, rowIndex: number) => (
                  <Fragment key={rowIndex}>
                    {row?.showWarning && (
                      <tr
                        key={`expandWarning-${rowIndex}`}
                        className="h-[25px] hover:bg-blue-900/5"
                      >
                        <td
                          colSpan={props.columns.length}
                          className="px-5 py-2 whitespace-nowrap text-center text-sm text-yellow-500 font-medium"
                        >
                          {row?.warning}
                        </td>
                      </tr>
                    )}
                    <tr key={`expandRow-${rowIndex}`} className="h-[57px]">
                      {props.columns.map((column: column, colIndex: number) => (
                        <td
                          key={`expandCol-${colIndex}`}
                          className={column.tdClassName}
                        >
                          {column.cell
                            ? column.cell(row, rowIndex)
                            : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto ">
          <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
            <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
              <tr>
                {props?.columns.map((column: column, index: number) => (
                  <th key={index} scope="col" className={column.thClassName}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
              {!props.isLoading && props.data === undefined && (
                <tr className="h-[57px]">
                  <td colSpan={100} className="px-6 py-4 text-gray-400 text-xs">
                    {props.Error}
                  </td>
                </tr>
              )}
              {props.data &&
                props.data.map((row, rowIndex: number) => (
                  <Fragment key={rowIndex}>
                    {row?.showWarning && (
                      <tr
                        key={`warning-${rowIndex}`}
                        className="h-[25px] hover:bg-blue-900/5"
                      >
                        <td
                          colSpan={props.columns.length}
                          className="px-5 py-4  whitespace-nowrap text-sm text-center text-yellow-500 font-medium"
                        >
                          {row?.warning}
                        </td>
                      </tr>
                    )}
                    <tr
                      key={`row-${rowIndex}`}
                      className="hover:bg-blue-900/5 h-[57px]"
                    >
                      {props.columns.map((column: column, colIndex: number) => (
                        <td
                          key={`col-${colIndex}`}
                          className={column.tdClassName}
                        >
                          {column.cell
                            ? column.cell(row, rowIndex)
                            : row[column.key]}
                        </td>
                      ))}
                    </tr>
                    {row.isExpanded ||
                    (props.expanded.length > 0 &&
                      props.expanded.includes(row.index))
                      ? props.renderRowSubComponent(row)
                      : null}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {props.isPagination && props.data ? (
        <Paginator
          count={props.count}
          isLoading={props.isLoading}
          page={props.page}
          limit={props.limit}
          pageLimit={props.pageLimit}
          setPage={props.setPage}
        />
      ) : null}
      {props.cursorPagination && props.data ? (
        <CursorPaginator
          apiUrl={props.apiUrl}
          count={props.count}
          limit={props.limit}
          setUrl={props.setUrl}
          cursor={props.cursor}
          isLoading={props.isLoading}
          ownerId={props.ownerId}
        />
      ) : null}
    </>
  );
}
