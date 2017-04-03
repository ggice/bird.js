import Base from './base'

class Bird {
  constructor(options) {
    var wrap = document.querySelector(options.el)

    wrap.innerHTML = options.template
    this.customEventHost = document.createElement('div')
    this.randers()
  }

  /**
   * @param {string} template
   * @param {object} data
   */
  component(name, options) {
    class Temp extends Base {
      getOptions() {
        return options
      }
    }
    document.registerElement(name, Temp)
  }

  randers() {
    //Do nothing
  }

  on(name, callback) {
    const { customEventHost } = this
    customEventHost.addEventListener(name, function(e) {
      e.preventDefault()
      e.stopPropagation()
      callback(e.detail)
    })
  }

  trigger(name, args) {
    const { customEventList, customEventHost } = this
    var event = new CustomEvent(name, {
      'detail': args
    });
    customEventHost.dispatchEvent(event)
  }
}

export default Bird
