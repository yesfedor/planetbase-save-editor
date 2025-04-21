const payload = {
  types: [],

  // additional info
  type: {
    Constructor: {
      namePrefix: 'CNT-',
      specialization: 'Constructor',
    },
    Carrier: {
      namePrefix: 'CR-',
      specialization: 'Carrier',
    },
    Driller: {
      namePrefix: 'DR-',
      specialization: 'Driller',
    },
  },
}

payload.types = Object.keys(payload.type)

module.exports = payload
