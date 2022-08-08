import { dataStageImpl, dataStage, dataStageImpl$1 } from './dataStage'
import { sendStageImpl, sendStage } from './sendStage'
export class CoreFeature {
  dataStage: { stage: null; init: (stage: any) => void }
  sendStage: {
    stage: null
    init: (stage: any) => void
    interceptor: { send: { entry: (data: any, context: any) => any } }
  }

  constructor() {
    this.dataStage = dataStageImpl
    this.sendStage = sendStageImpl
  }
}

export class DataFormatFeature {
  dataStage: {
    init: () => void
    interceptor: { formatData: { priority: number; entry: (data: any) => any } }
  }

  constructor() {
    this.dataStage = dataStageImpl$1
  }
}

export function registerFeature(feature: any) {
  feature && feature.dataStage && dataStage.registerStageImplementation(feature.dataStage)
  feature && feature.sendStage && sendStage.registerStageImplementation(feature.sendStage)
}
