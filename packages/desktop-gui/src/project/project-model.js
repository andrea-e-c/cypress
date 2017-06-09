import _ from 'lodash'
import { computed, observable, action } from 'mobx'
import Browser from '../lib/browser-model'

const cacheProps = [
  'id',
  'path',
  'name',
  'public',
  'orgName',
  'orgId',
  'defaultOrg',
  'lastBuildStatus',
  'lastBuildCreatedAt',
]

const validProps = cacheProps.concat([
  'state',
  'clientId',
  'isChosen',
  'isLoading',
  'isNew',
  'browsers',
  'onBoardingModalOpen',
  'browserState',
  'resolvedConfig',
  'error',
  'parentTestsFolderDisplay',
  'integrationExampleName',
  'scaffoldedFiles',
])

export default class Project {
  // state constants
  static VALID = 'VALID'
  static INVALID = 'INVALID'
  static UNAUTHORIZED = 'UNAUTHORIZED'

  // persisted with api
  @observable id
  @observable name
  @observable public
  @observable lastBuildStatus
  @observable lastBuildCreatedAt
  @observable orgName
  @observable orgId
  @observable defaultOrg
  // comes from ipc, but not persisted
  @observable state = Project.VALID
  // local state
  @observable clientId
  @observable isChosen = false
  @observable isLoading = false
  @observable isNew = false
  @observable browsers = []
  @observable onBoardingModalOpen = false
  @observable browserState = "closed"
  @observable resolvedConfig
  @observable error
  @observable parentTestsFolderDisplay
  @observable integrationExampleName
  @observable scaffoldedFiles = []
  // should never change after first set
  @observable path

  constructor (props) {
    this.path = props.path
    this.clientId = encodeURIComponent(props.path)

    this.update(props)
  }

  @action update (props) {
    if (!props) return

    _.each(validProps, (prop) => {
      this._updateProp(props, prop)
    })
  }

  _updateProp (props, prop) {
    if (props[prop] != null) this[prop] = props[prop]
  }

  clientDetails () {
    return _.pick(this, 'id', 'path')
  }

  serialize () {
    return _.pick(this, cacheProps)
  }

  @computed get displayName () {
    if (this.name) return this.name

    let splitName = _.last(this.path.split('/'))
    return _.truncate(splitName, { length: 60 })
  }

  @computed get displayPath () {
    const maxPathLength = 45
    if (this.path.length <= maxPathLength) return this.path

    const truncatedPath = this.path.slice((this.path.length - 1) - maxPathLength, this.path.length)
    return '...'.concat(truncatedPath)
  }

  @computed get isValid () {
    return this.state === Project.VALID
  }

  @computed get otherBrowsers () {
    return _.filter(this.browsers, { isChosen: false })
  }

  @computed get chosenBrowser () {
    return _.find(this.browsers, { isChosen: true })
  }

  @computed get defaultBrowser () {
    return this.browsers[0]
  }

  @action setLoading (isLoading) {
    this.isLoading = isLoading
  }

  @action openModal () {
    this.onBoardingModalOpen = true
  }

  @action closeModal () {
    this.onBoardingModalOpen = false
  }

  @action browserOpening () {
    this.browserState = "opening"
  }

  @action browserOpened () {
    this.browserState = "opened"
  }

  @action browserClosed () {
    this.browserState = "closed"
  }

  @action setBrowsers (browsers = []) {
    if (browsers.length) {
      this.browsers = _.map(browsers, (browser) => {
        return new Browser(browser)
      })
      // if they already have a browser chosen
      // that's been saved in localStorage, then select that
      // otherwise just do the default.
      if (localStorage.getItem('chosenBrowser')) {
        this.setChosenBrowserByName(localStorage.getItem('chosenBrowser'))
      } else {
        this.setChosenBrowser(this.defaultBrowser)
      }
    }
  }

  @action setChosenBrowser (browser) {
    _.each(this.browsers, (browser) => {
      browser.isChosen = false
    })
    localStorage.setItem('chosenBrowser', browser.name)
    browser.isChosen = true
  }

  @action setOnBoardingConfig (config) {
    this.isNew = config.isNewProject
    this.integrationExampleFile = config.integrationExampleFile
    this.integrationFolder = config.integrationFolder
    this.parentTestsFolderDisplay = config.parentTestsFolderDisplay
    this.fileServerFolder = config.fileServerFolder
    this.integrationExampleName = config.integrationExampleName
    this.scaffoldedFiles = config.scaffoldedFiles
  }

  @action setResolvedConfig (resolved) {
    this.resolvedConfig = resolved
  }

  @action setError = (err = {}) => {
    this.error = err.message || err
  }

  setChosenBrowserByName (name) {
    const browser = _.find(this.browsers, { name }) || this.defaultBrowser
    this.setChosenBrowser(browser)
  }

  @action clearError () {
    this.error = undefined
  }
}
