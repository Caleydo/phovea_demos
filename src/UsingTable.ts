import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import {range, list, join, Range, Range1D, all} from 'phovea_core/src/range';

/**
 *
 * This class demonstrates the use of a heterogeneous table.
 *
 * The relevant Phovea Classes:
 *
 * Accessing datasets using various functions:
 * https://github.com/phovea/phovea_core/blob/develop/src/data.ts
 * The phovea table interface:
 * https://github.com/phovea/phovea_core/blob/develop/src/table.ts
 *
 * The phovea vector:
 * https://github.com/phovea/phovea_core/blob/develop/src/vector/IVector.ts
 *
 */
export default class UsingTable {


  public async demoTable() {
    const table: ITable = await this.loadLocalData(csvUrl);

    // Loading table from server - no server used in the demo ATM
    // let table: ITable = await this.loadDataFromServer();

    this.demoTableUsage(table);
  }

  /**
   * Load a datset from a local file
   * @returns {Promise<ITable>}
   */
  public async loadLocalData(csvURL: string) {
    console.log('Loading Data from the URL defined in csvUrl');
    const data = await UsingTable.tsvAsync(csvUrl);
    console.log('The data as an array of objects: ');
    console.log(data);
    const table = asTable(data);
    return table;
  }

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
   * This demonstrates how to retreive a table from a server.
   * @returns {Promise<void>}
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
    table = <ITable> await getById('numer-one-artists');

    return table;

  }


  /**
   * This demonstrates a wide variety of possible usages for the table.
   * @param table
   * @returns {Promise<void>}
   */
  public async demoTableUsage(table: ITable) {

    console.log('=============================');
    console.log('RETRIEVING DATA');
    console.log('=============================');

    console.log('The Table as passed via parameter:');
    console.log(table);

    console.log('=============================');
    console.log('ACCESSING METADATA');
    console.log('=============================');

    // Accessing the description of the dataset:
    console.log('Table description:');
    console.log(table.desc);
    // Printing the name
    console.log('Table Name: ' + table.desc.name);

    console.log('Artist Table description:');
    console.log(table.desc);
    // Printing the name
    console.log('Table Name: ' + table.desc.name);


    console.log('=============================');
    console.log('ACCESSING COLUMNS/VECTORS');
    console.log('=============================');

    // Here we retrieve the first vector from the table.
    const vector = table.col(0);
    console.log('The first vector:');
    console.log(vector);
    console.log('Length:' + vector.length);
    console.log('IDType:' + vector.idtype);


    // Access the data of a vector by name:
    console.log('Accessing artist column by name from Artists dataset:');
    console.log(await table.colData('artist'));


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
    const firstValueOfFirstVector = await table.at(0, 0);
    console.log('Accessing the Table for the first element: ' + firstValueOfFirstVector);

    console.log('=============================');
    console.log('SLICING, SELECTIVE ACCESS');
    console.log('=============================');

    // We retrieve the columns with index 0 and one by using a range operator that we pass as a string.
    console.log('First two columns using ranges:');
    console.log(table.cols('0:2'));

    console.log('Get the columns based on a list of indices:');
    console.log(table.cols([1, 4, 7]));

    console.log('A slice of the data of column 1 from index 7 to (not including) 12 as an array:');
    // this array can be directly used to map to d3
    console.log(await table.col(1).data('7:12'));


    console.log('=============================');
    console.log('CATEGORICAL VECTORS & STATS');
    console.log('=============================');


    console.log('The data type of the fourth column (categories):');
    console.log(table.col(3).valuetype);

    if (table.col(3).valuetype.type === VALUE_TYPE_CATEGORICAL) {
      const catVector = <ICategoricalVector> table.col(3);
      console.log('The categories of the fourth column:');
      // these also contain colors that can be easily used in d3.
      console.log(catVector.valuetype.categories);
      console.log('The histogram:');
      console.log(await catVector.hist());
    }


    console.log('=============================');
    console.log('NUMERICAL VECTORS & STATS');
    console.log('=============================');

    if (table.col(5).valuetype.type === VALUE_TYPE_INT) {
      const numVector = <INumericalVector> table.col(5);
      console.log('3rd value from the 5th vector:' + await numVector.at(3));
      console.log('Stats on a vector:');
      console.log(await numVector.stats());
    }

    console.log('=============================');
    console.log('VIEWS');
    console.log('=============================');

    // A view represents a subset of a table. Subsets can be defined via rows and/or columns.
    // So, in a 10x100 table, I can pick columns 2, 4 and rows, 2-5 and 70-90.
    // It behaves exactly like a regular table.

    // console.log('New view on a table that only contains the first two columns:');
    // let slicedTable = table.view('(0:-1),(0:2)');
    // console.log(slicedTable);

    console.log('A range with all values:');
    const fullRange = all();
    console.log(fullRange);

    console.log('A range from 0 to 10 that skipse every second element:');
    const selectedIndicesRange = range([0, 10, 2]);
    console.log(selectedIndicesRange);

    console.log('A range with from-to values:');
    const fromToRange = range(0, 5);
    console.log(fromToRange);


    const fiveColsAllRows = join(all(), fromToRange);
    const columnSlicedTable = table.view(fiveColsAllRows);
    // FIXME: wrong
    console.log(columnSlicedTable.dim);
    console.log('A table with five columns and all rows:');
    console.log(columnSlicedTable);


    // FIXME: demonstration of the row slicing bug

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
    const slicedTable = table.view(mutiDimRange);
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
