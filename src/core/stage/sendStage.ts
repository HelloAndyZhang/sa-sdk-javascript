import Stage from '../../helper/Stage'
import ufox from '../..'
export let processDef = {
  beforeSend: 'send',
  send: 'afterSend',
  afterSend: null
}

export let sendStage = new Stage(processDef)
export let sendStageImpl = {
  stage: null,
  init: function (stage: any) {
    this.stage = stage
  },
  interceptor: {
    send: {
      entry: function (data: any, context: any) {
        var callback = data.callback

        if (!ufox.para.app_js_bridge) {
          // ufox.debug.apph5({
          //   data: data.data,
          //   step: '1',
          //   output: 'code'
          // });
          ufox.sendState.prepareServerUrl(data)
          return data
        }

        // if (!sd.para.app_js_bridge.is_mui) {
        //   if (sd.para.app_js_bridge.is_send === true) {
        //     sd.debug.apph5({
        //       data: data.data,
        //       step: '2',
        //       output: 'all'
        //     });
        //     sd.sendState.prepareServerUrl(data);
        //     return data;
        //   }
        //   sd._.isFunction(callback) && callback();
        //   return data;
        // }

        // if (sd.para.app_js_bridge.is_mui) {
        //   if (window.plus && window.plus.SDAnalytics && window.plus.SDAnalytics.trackH5Event) {
        //     window.plus.SDAnalytics.trackH5Event(data);
        //     sd._.isFunction(callback) && callback();
        //     return data;
        //   }

        //   if (sd.para.app_js_bridge.is_send === true) {
        //     sd.sendState.prepareServerUrl(data);
        //     return data;
        //   }

        //   sd._.isFunction(callback) && callback();
        //   return data;
        // }
      }
    }
  }
}
