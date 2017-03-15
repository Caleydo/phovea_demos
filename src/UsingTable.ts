import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
//import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import {range, list, join, Range, Range1D, all} from 'phovea_core/src/range';
import {asVector} from '../../phovea_core/src/vector/Vector';

/**
 *
 * This class demonstrates the use of a heterogeneous table.
 *
 * It is meant as a companion to the tutorial here:
 * http://phovea.caleydo.org/tutorials/data_structure/
 *
 * The relevant Phovea Classes:
 * ----------------------------
 * The Phovea table interface:
 * https://github.com/phovea/phovea_core/blob/develop/src/table/ITable.ts
 * Accessing datasets using various functions:
 * https://github.com/phovea/phovea_core/blob/develop/src/data.ts
 * The Phovea vector:
 * https://github.com/phovea/phovea_core/blob/develop/src/vector/IVector.ts
 * Phovea ranges (see also other files in that folder):
 * https://github.com/phovea/phovea_core/blob/develop/src/range/index.ts
 */
export default class UsingTable {

  /** The table datastructure */
  table: ITable;

  /**
   * Calling the various methods that demonstrate the table
   * @return {Promise<void>}
   */
  public async demoTable() {
    // change the second parameter to false if you want to see console output
    //await this.loadLocalData(true);
    // Loading table from server - no server used in the demo ATM
    await this.loadDataFromServer();

    // comment out the things you don't need to clean up console output
    // await this.basicTableUsage();
    await this.gettingStats();
    // await this.rangesAndSlicing();
    // await this.accessingDataWithRanges();
    // await this.tableViews();
    await this.idsAndIndices();
  }

  /**
   * Load a dataset from a local file and stores it in this.table.
   */
  // public async loadLocalData(silent: boolean = false) {
  //
  //   // TODO this doesn't seem to care about the index.json, right?
  //
  //   if (!silent) {
  //     console.log('=============================');
  //     console.log('Loading DATA');
  //     console.log('=============================');
  //
  //     console.log('Loading Data from the URL defined in csvUrl');
  //   }
  //   const data: any[] = await UsingTable.tsvAsync(csvUrl);
  //   this.table = asTable(data);
  //
  //   if (!silent) {
  //     console.log('The data as an array of objects: ');
  //     console.log(data);
  //     console.log('The table in the ITable datastructure');
  //     console.log(this.table);
  //   }
  // }

  /**
   * Load the data from a csv in a URL file to a data array
   * @param url
   * @return {Promise<any[]>} a promise for the data as an array
   */
  private static async tsvAsync(url: string) {
    return new Promise<any[]>((resolve, reject) => {
      tsv(url, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  /**
   * This demonstrates how to retrieve a table from a server. Stores the number one artists table in this.table.
   * See also https://github.com/phovea/phovea_core/blob/develop/src/data.ts
   */
  public async loadDataFromServer() {
    console.log('Loading Data from the a Server');
    // listData() returns a list of all datasets loaded by the server
    // notice the await keyword - you'll see an explanation below
    const allDatasets = await listData();
    console.log('All loaded datasets:');
    console.log(allDatasets);

    // we could use those dataset to filter them based on their description and pick the one(s) we're interested in
    // here we pick the first dataset and cast it to ITable - by default the datasets are returned as IDataType
    let tempTable: ITable;
    // retrieving a dataset by name. Note that only the first dataset will be returned.
    tempTable = <ITable> await getFirstByName('Artists');
    console.log(await tempTable.cols()[1].data());
    console.log('Artist dataset retrieved by name:');
    console.log(tempTable);

    // retrieving a dataset by it's ID
    this.table = <ITable> await getById('number-one-artists');
  }


  /**
   * This demonstrates basic usage of the table.
   * See also: https://github.com/phovea/phovea_core/blob/develop/src/table/ITable.ts
   * https://github.com/phovea/phovea_core/blob/develop/src/vector/IVector.ts
   */
  public async basicTableUsage() {
    console.log('=============================');
    console.log('ACCESSING METADATA');
    console.log('=============================');

    // Accessing the description of the dataset:
    console.log('Table description:');
    console.log(this.table.desc);
    // Printing the name
    console.log('Table Name: ' + this.table.desc.name);

    console.log('Artist Table description:');
    console.log(this.table.desc);

    console.log('The dimensions of the table [rows, columns]:');
    console.log(this.table.dim);


    console.log('=============================');
    console.log('ACCESSING COLUMNS/VECTORS');
    console.log('=============================');

    // Here we retrieve the first vector from the table.
    const vector = this.table.col(0);
    console.log('The first vector:');
    console.log(vector);
    console.log('Length:' + vector.length);
    console.log('IDType:' + vector.idtype);


    // Access the data of a vector by name:
    console.log('Accessing artist column by name from Artists dataset:');
    console.log(await this.table.colData('artist'));


    console.log('=============================');
    console.log('ACCESSING RAW DATA');
    console.log('=============================');


    // whenever you access raw data, the data structures return promises, not the data directly.
    // what you do is, you call a then function which takes a callback as a parameter.
    // This handles the 'good' case and passes the data in.
    // You should also handle the 'bad' case in a catch function:
    const firstPromise = vector.at(0).then(
      function (d) {
        console.log('The data:');
        console.log(d);
        return d;
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      });

    // Here is exactly the same code using the arrow notation, for the second element in the vector.
    const secondPromise = vector.at(1).then((d) => d)
      .catch((err) => console.log('Error: ' + err));

    Promise.all([firstPromise, secondPromise]).then((values) => {
      console.log('First Element: ' + values[0]);
      console.log('Second Element: ' + values[1]);
      // all the return values of the promises
      console.log(values);
    }).catch((err) => console.log(err));


    // a new feature is the await keyword, which makes all of this a lot easier to read:
    const thirdElement = await vector.at(2);
    const fourthElement = await vector.at(3);

    console.log('Third Element: ' + thirdElement);
    console.log('Fourth Element: ' + fourthElement);

    // Here we directly access the first element in the first vector:
    const firstValueOfFirstVector = await this.table.at(0, 0);
    console.log('Accessing the Table for the first element: ' + firstValueOfFirstVector);

    console.log('The whole dataset as a 2D array; row based:');
    console.log(await this.table.data());

    console.log('The whole dataset as objects corresponding to one row each:');
    console.log(await this.table.objects());
  }

  /**
   * This demonstrates how to access statistics about the table and vectors
   * https://github.com/phovea/phovea_core/blob/develop/src/math.ts
   */
  public async gettingStats() {
    console.log('=============================');
    console.log('CATEGORICAL VECTORS & STATS');
    console.log('=============================');

    console.log('The data type of the fourth column (categories):');
    console.log(this.table.col(3).valuetype);

    if (this.table.col(3).valuetype.type === VALUE_TYPE_CATEGORICAL) {
      const catVector = <ICategoricalVector> this.table.col(3);
      console.log('The categories of the fourth column:');
      // these also contain colors that can be easily used in d3.
      console.log(catVector.valuetype.categories);
      console.log('The histogram:');
      console.log(await catVector.hist());
    }


    console.log('=============================');
    console.log('NUMERICAL VECTORS & STATS');
    console.log('=============================');

    if (this.table.col(11).valuetype.type === VALUE_TYPE_INT) {
      const numVector = <INumericalVector> this.table.col(11);
      console.log('A Vector of numerical data that also has NAN values - FIXME this is worng - should be NAN not empty string.');
      console.log(await numVector.data());
      console.log('3rd value from the 11th vector:' + await numVector.at(3));
      console.log('12th value from the 11th vector (missing value):' + await numVector.at(11));
      console.log('Stats on a vector: FIXME this is wrong - empty strings are treated as 0, hence min is 0 and not 11');
      console.log(await numVector.stats());
      console.log(await numVector.hist());
    }
  }

  /**
   * Introducing ranges that define a subset of the data and how to slice data with them
   * https://github.com/phovea/phovea_core/blob/develop/src/range/index.ts
   */
  public async rangesAndSlicing() {
    console.log('=============================');
    console.log('Ranges');
    console.log('=============================');

    console.log('The Vector we use to demonstrate ranges:');
    const vector = asVector(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    console.log(await vector.data());


    console.log('A range with all values. Notice the isAll: true:');
    let fullRange = all();
    console.log(fullRange);
    console.log('The full vector:', await vector.data(fullRange));

    console.log('Alternatively, a range created via constructor with no values produces an all-value range:');
    fullRange = new Range();
    console.log('The full vector:', await vector.data(fullRange));

    let selectedIndicesRange = range(3);
    console.log('A range applied to the vector starting at index 3, up to the end');
    console.log(await vector.data(selectedIndicesRange));


    selectedIndicesRange = range(3, 11);
    console.log('A range applied to the vector starting at index 3, up to (and excluding) 11');
    console.log(await vector.data(selectedIndicesRange));

    selectedIndicesRange = range(3, 11, 2);
    console.log('A range applied to the vector starting at index 11, up to (and excluding) 2, using every element' +
      ' backwards');
    console.log(await vector.data(selectedIndicesRange));

    // using an array with from / to / step
    selectedIndicesRange = range([11, 2, -1]);
    console.log('A range applied to the vector starting at index 3, up to (and excluding) 11, using every other element');
    console.log(await vector.data(selectedIndicesRange));

    // using an object with explicit from / to / step
    selectedIndicesRange = range({from: 4, to: 12, step: 3});
    console.log('A range using object notation applied to the vector starting at index 4, up to (and excluding)' +
      ' 12, using every third element');
    console.log(await vector.data(selectedIndicesRange));


    // using an array of list indices
    let listRange = list([2, 5, 1, 13]);
    console.log('A range defined using a list of indices (2, 5, 1, 13)');
    console.log(await vector.data(listRange));

    // using indices as parameters
    listRange = list(13, 12, 11);
    console.log('A range defined using a list of indices (13, 12, 11)');
    console.log(await vector.data(listRange));
  }

  /**
   * Demonstrates how to access data from a table using ranges.
   * Many functions in the table and the vector take RangeLike objects and create ranges from them automatically. Make
   * sure to look at that here:
   * https://github.com/phovea/phovea_core/blob/develop/src/range/index.ts
   * @return {Promise<void>}
   */
  public async accessingDataWithRanges() {
    console.log('=============================');
    console.log('RANGES AND TABLES');
    console.log('=============================');

    // We retrieve the columns with index 0 and one by using a range operator that we pass as a string.
    console.log('First two columns using ranges:');
    console.log(this.table.cols(range(0, 2)));

    console.log('Get the columns based on a list of indices:');
    // This uses the RangeLike array property which automatically creates an index list
    console.log(this.table.cols([1, 4, 7]));

    console.log('A slice of the data of column 1 from index 7 to (not including) 12 as an array:');
    // this array can be directly used, e.g., to map to d3
    console.log(await this.table.col(1).data(range(7, 12)));

    console.log('Accessing rows 0, 1, 2, 3');
    console.log(await this.table.data([0, 1, 2, 3]));

    console.log('Accessing the attribute 0, 1, 2 in rows 0, 1, 2, 3');
    // we create a 2D range by joining two other ranges.  The first range defines the rows, the second the columns
    const twoDRange = join(list([0, 1, 2, 3]), list([0, 1, 2]));
    console.log(await this.table.data(twoDRange));

    console.log('Accessing the attribute 0, 1, 2 in rows 0, 1, 2, 3 using objects');
    console.log(await this.table.objects(twoDRange));
  }

  /**
   * Working with table views that allow you to slice and sort tables and work with the views just like with regular
   * tables
   */
  public async tableViews() {
    console.log('=============================');
    console.log('VIEWS');
    console.log('=============================');

    // A view represents a subset of a table. Subsets can be defined via rows and/or columns.
    // So, in a 10x100 table, I can pick columns 2, 4 and rows, 2-5 and 70-90.
    // It behaves exactly like a regular table.

    // We create a range for all rows and columns 0 to (excluding) 5
    const fiveColsAllRows = join(all(), range(0, 5));
    const columnSlicedTable = this.table.view(fiveColsAllRows);
    console.log('A table view with five columns and all rows:');
    console.log('Table:');
    console.log(columnSlicedTable);
    console.log('Data:');
    console.log(await columnSlicedTable.data());
    console.log('The table view\'s dimensions [rows, columns], expecting [12, 5]');
    console.log(columnSlicedTable.dim);

    console.log('Vectors:');
    console.log(await columnSlicedTable.cols());
    console.log('Data of the second Vector:');
    console.log(await columnSlicedTable.cols()[1].data());


    console.log('-----------');
    console.log('A table with all columns and rows 4, 2 and 6 (in that order)');
    console.log('-----------');
    const threeRowsAllCols = join(list([4, 2, 6]), all());
    const threeRowsTable = this.table.view(threeRowsAllCols);
    console.log(threeRowsTable);

    console.log('Data:');
    console.log(await threeRowsTable.data());

    console.log('The size of the table [rows, cols], expecting [3, 14]');
    console.log(threeRowsTable.dim);

    console.log('Data of the first Vector:');
    console.log(await threeRowsTable.cols()[0].data());

    console.log('Data of the second Vector:');
    console.log(await threeRowsTable.cols()[1].data());


    console.log('-----------');
    console.log('A table with rows 4, 2, 6 and columns 0, 1 (in that order)');
    console.log('-----------');
    const threeRowsTwoCols = join(list([4, 2, 6]), range(0, 2));
    const threeRowsTwoColsTable = this.table.view(threeRowsTwoCols);
    console.log(threeRowsTwoColsTable);

    console.log('Data:');
    console.log(await threeRowsTwoColsTable.data());

    console.log('The size of the table [rows, cols], expecting [3, 2]');
    console.log(threeRowsTwoColsTable.dim);

    console.log('Data of the first Vector:');
    console.log(await threeRowsTwoColsTable.cols()[0].data());

    console.log('Data of the second Vector:');
    console.log(await threeRowsTwoColsTable.cols()[1].data());
  }

  /**
   * Demonstrate the use of row names, IDs and indices and the conversions between them.
   *
   *
   * @return {Promise<void>}
   */
  public async idsAndIndices() {

    console.log('=============================');
    console.log('WORKING WITH IDS AND INDICES');
    console.log('=============================');

    console.log('The ID Type of the table');
    console.log(this.table.idtype);

    console.log('The IDs of the rows, represented as a range');
    const rowIDRange = await this.table.rowIds();
    console.log(rowIDRange);

    console.log('Converting system IDs to row names:');
    console.log(await this.table.idtype.unmap(rowIDRange));

    console.log('The row names (string IDs) from indices');
    console.log(await this.table.rows([0, 1, 2, 3]));

    const rowNames = ['rih', 'bri', 'whi'];

    console.log('Converting an array or row names to row IDs:');
    const convertedRowIDs = await this.table.idtype.map(rowNames);
    console.log(convertedRowIDs);

    console.log('Creating a table view based on IDs:');
    const rowSlicedTable = await this.table.idView(convertedRowIDs);
    console.log('Table:');
    console.log(rowSlicedTable);
    console.log('Data: FIXME this is wrong, missing Rhianna ');
    console.log(await rowSlicedTable.data());
  }
}

/**
 * Method to create a new table demo instance
 */
export function create() {
  return new UsingTable();
}
