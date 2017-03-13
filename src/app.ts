/**
 * Created by Caleydo Team on 31.08.2016.
 */

import * as d3 from 'd3';
import * as UsingTable from './UsingTable';
import {HELLO_WORLD} from './language';

// mark the core to work offline - comment the next two lines out if working with a server!
import {init as initCore} from 'phovea_core/src';
initCore({offline: false});

/**
 * The main class for the App app
 */
export class App {

  private $node;

  constructor(parent:Element) {
    this.$node = d3.select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<App>}
   */
  init() {
    return this.build();
  }

  /**
   * Load and initialize all necessary views
   * @returns {Promise<App>}
   */
  private build() {
    this.$node.html('<p>This plugin demonstrates the usage of various Phovea concepts.</p> Currently this is limited to the Table.</p> <p> Open a console to look at the output</p>');

    const usingTables = UsingTable.create();
    usingTables.demoTable();


    return Promise.resolve(null);
  }

  /**
   * Show or hide the application loading indicator
   * @param isBusy
   */
  setBusy(isBusy: boolean) {
    this.$node.select('.busy').classed('hidden', !isBusy);
  }

}

/**
 * Factory method to create a new app instance
 * @param parent
 * @returns {App}
 */
export function create(parent:Element) {
  return new App(parent);
}
