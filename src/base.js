import logs from 'common/logs'
import ID from 'common/id'
import BTP from './btp'
import Diff from './diff'

class Base extends HTMLElement {
  constructor(options) {
    super()
    this.options = options
  }

  static get observedAttributes() {
    return ['b-data']
  }

  connectedCallback() {
    this.init()
    const {
      created,
    } = this

    if (!created) {
      return
    }
    created.apply(this)
  }

  adoptedCallback() {
    const {
      attached,
    } = this

    if (!attached) {
      return
    }
    attached.apply(this)
  }

  disconnectedCallback() {
    const {
      removed,
    } = this

    if (!removed) {
      return
    }
    removed.apply(this)
  }

  attributeChangedCallback(name, oldVal, newVal) {
    const {
      attributeChanged,
    } = this

    if (attributeChanged) {
      attributeChanged.apply(this, name, oldVal, newVal)
    }
    this.reRender(name)
  }

  init() {
    const {
      template,
      data,
      created,
      styles,
      stylesLink,
      rendered,
    } = this.options || {}

    if (!data) {
      this.data = null
    } else {
      this.data = data
      this.initData = Object.assign({}, data)
    }
    this.initShadowEL()
    this.applyAttrToData()
    this.template = template || ''
    this.styles = styles
    this.stylesLink = stylesLink
    this.rendered = rendered
    this.created = created
    this.applyDataToAttr(this.data)
    this.render()
    this.options = null
  }

  parse() {
    return BTP.parse(this)
  }

  initShadowEL() {
    this.tempShadow = document.createElement('div').attachShadow({
      mode: 'open',
    })
    this.shadow = this.attachShadow({
      mode: 'open',
    })
  }

  applyAttrToData() {
    let data = this.getAttribute('b-model')
    try {
      data = JSON.parse((data || '{}').replace(/&nbsp;/g, ' '))
    } catch (e) {
      logs.warn('Have error : ', e)
      data = {}
    }
    this.data = Object.assign({}, this.data, data)
    this.setAttribute('b-model', ID.getNewId())
  }

  applyDataToAttr() {
    this.setAttribute('b-data', ID.getNewId())
  }

  setData(data) {
    this.data = Object.assign(this.data, data)
    this.applyDataToAttr(data)
  }

  render() {
    this.shadow.innerHTML = this.parse()
    this.bindEvents()
    if (!this.rendered) {
      return
    }
    this.rendered()
  }

  reRender() {
    this.tempShadow.innerHTML = this.parse()
    Diff.diffAsyn(this.tempShadow, this.shadow)
    if (!this.rendered) {
      return
    }
    this.rendered()
  }

  /**
   * Bind events，after render
   */
  bindEvents() {
    const els = this.shadow
    this.buildChildEvents(els)
  }

  buildChildEvents(fEl) {
    [].forEach.call(fEl.childNodes, (el) => {
      if (el.attributes && el.attributes.length > 0) {
        [].forEach.call(el.attributes, (attr) => {
          const funName = attr.value.match(/function\[(\w+)\]/)

          if (!funName || !funName[1]) {
            return
          }
          const funText = this.data[funName[1]]
          const eventName = attr.name.replace('on-', '').toLowerCase()
          if (funText) {
            el.addEventListener(eventName, funText.bind(this))
          }
        })
      }
      this.buildChildEvents(el)
    })
  }
}

export default Base
