import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
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
    await this.loadLocalData(csvUrl);
    // Loading table from server - no server used in the demo ATM
    // await this.loadDataFromServer();
    //await this.basicTableUsage();
    //await this.gettingStats();
    await this.rangesAndSlicing();
    //await this.tableViews();


  }

  /**
   * Load a datset from a local file and stores it in this.table.
   */
  public async loadLocalData(csvURL: string) {
    console.log('=============================');
    console.log('Loading DATA');
    console.log('=============================');

    console.log('Loading Data from the URL defined in csvUrl');
    const data = await UsingTable.tsvAsync(csvUrl);
    console.log('The data as an array of objects: ');
    console.log(data);
    this.table = asTable(data);
    console.log('The table in the ITable datastructure');
    console.log(this.table);
  }

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
    let table: ITable = <ITable> allDatasets[0];

    // retrieving a dataset by name. Note that only the first dataset will be returned.
    table = <ITable> await getFirstByName('Artists');
    console.log('Artist dataset retrieved by name:');
    console.log(table);

    // retrieving a dataset by it's ID
    this.table = <ITable> await getById('numer-one-artists');
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
    // Printing the name
    console.log('Table Name: ' + this.table.desc.name);


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

    if (this.table.col(5).valuetype.type === VALUE_TYPE_INT) {
      const numVector = <INumericalVector> this.table.col(5);
      console.log('3rd value from the 5th vector:' + await numVector.at(3));
      console.log('Stats on a vector:');
      console.log(await numVector.stats());
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

    console.log('The Vector we use to demonstrate rages:');
    const vector = asVector(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    console.log(await vector.data());


    console.log('A range with all values. Notice the isAll: true:');
    let fullRange = all();
    console.log(fullRange);
    console.log('The full vector:', await vector.data(fullRange));

    console.log('Alternatively, a range created via constructor with no values produces an all-value range:');
    fullRange = new Range();
    console.log('The full vector:', await vector.data(fullRange));

    let selectedIndicesRange = range([3]);
    console.log('A range applied to the vector starting at index 3, up to the end');
    console.log(await vector.data(selectedIndicesRange));


    selectedIndicesRange = range([3, 11]);
    console.log('A range applied to the vector starting at index 3, up to (and excluding) 11');
    console.log(await vector.data(selectedIndicesRange));

    selectedIndicesRange = range([3, 11, 2]);
    console.log('A range applied to the vector starting at index 11, up to (and excluding) 2, using every element' +
      ' backwards');
    console.log(await vector.data(selectedIndicesRange));

        selectedIndicesRange = range([11, 2, -1]);
    console.log('A range applied to the vector starting at index 3, up to (and excluding) 11, using every other element');
    console.log(await vector.data(selectedIndicesRange));

    selectedIndicesRange = range({from: 4, to: 12, step: 3});
    console.log('A range using object notation applied to the vector starting at index 4, up to (and excluding)' +
      ' 12, using every third element');
    console.log(await vector.data(selectedIndicesRange));


    console.log('A range defined using a list of indices (2, 5, 1, 13)');
    let listRange = list([2, 5, 1, 13]);
    console.log(await vector.data(listRange));

    console.log('A range defined using a list of indices (13, 12, 11)');
    listRange = list([13, 12, 11]);
    console.log(await vector.data(listRange));

    console.log('=============================');
    console.log('RANGES AND TABLES');
    console.log('=============================');

    // We retrieve the columns with index 0 and one by using a range operator that we pass as a string.
    console.log('First two columns using ranges:');
    console.log(this.table.cols('0:2'));

    console.log('Get the columns based on a list of indices:');
    console.log(this.table.cols([1, 4, 7]));

    console.log('A slice of the data of column 1 from index 7 to (not including) 12 as an array:');
    // this array can be directly used to map to d3
    console.log(await this.table.col(1).data('7:12'));
  }

  /**
   * Working with table views that allow you to slice and sort tables
   */
  public async tableViews() {
    console.log('=============================');
    console.log('VIEWS');
    console.log('=============================');

    // A view represents a subset of a table. Subsets can be defined via rows and/or columns.
    // So, in a 10x100 table, I can pick columns 2, 4 and rows, 2-5 and 70-90.
    // It behaves exactly like a regular table.


    console.log('A range with from-to values:');
    const fromToRange = range(0, 5);
    console.log(fromToRange);


    const fiveColsAllRows = join(all(), fromToRange);
    const columnSlicedTable = this.table.view(fiveColsAllRows);
    console.log('-----------');
    console.log('A table with five columns and all rows:');
    console.log('-----------');
    console.log('Dimensions:');
    console.log(columnSlicedTable.dim);
    console.log('Table:');
    console.log(columnSlicedTable);
    console.log('Vectors:');
    console.log(await columnSlicedTable.cols());
    console.log('Data of first Vector:');
    console.log(await columnSlicedTable.cols()[0].data());


    console.log('-----------');
    console.log('A table with all columns and three rows:');
    console.log('-----------');
    console.log('A range based on lists:');
    const listRange = list([0, 1, 2]);
    console.log(listRange);

    const allRange = all();
    console.log(allRange);

    // We join two ranges so that we can create a TableView following the convention, columns first, rows second
    // Here we define that we want to keep all columns but only the rows 0, 1, 2
    const mutiDimRange = join(listRange, allRange);
    console.log('The multidimensional range, rows first, column second:');
    console.log(mutiDimRange);

    console.log('This is supposed to slice the table by preserving ALL columns and the rows 0,1,2:');
    const slicedTable = this.table.view(mutiDimRange);
    console.log(slicedTable);

    console.log('The size of the Table, expecting 3, 12 as in 12 columns and 3 rows. Is WRONG 12, 14 - no idea where the 14 came from');
    console.log(slicedTable.dim);

    console.log('The length of the first vector, expecting 3, is WRONG 12');

    const myFCol = await slicedTable.cols()[0];
    console.log(await myFCol.data(new Range()));

    const columns = slicedTable.cols();
    console.log(columns);

    // if (columns[2].valuetype.type === VALUE_TYPE_CATEGORICAL) {
    //   const catVector = <ICategoricalVector> table.col(3);
    //   console.log('The categories of the fourth column out of a sliced table:');
    //   // these also contain colors that can be easily used in d3.
    //   console.log(catVector.valuetype.categories);
    //   console.log('The histogram:');
    //   console.log(await catVector.hist());
    // }

    // const stringSlicedTable = table.view('(0,3),(0,5)');
    // console.log(stringSlicedTable);
    //
    // console.log('The size of the String Sliced Table, expecting 12, 3 as in 12 columns and 3 rows. Is WRONG 12, 14 - no idea where the 14 came from');
    // console.log(stringSlicedTable.dim);
    //
    // console.log('The length of the first vector, expecting 3, is WRONG 12');
    // console.log(await stringSlicedTable.cols());
    //
    // const myVector = await stringSlicedTable.col(1);
    //
    // console.log(myVector.dim);


  }
}

/**
 * Method to create a new graphData instance
 * @returns {graphData}
 */
export function create() {
  return new UsingTable();
}
