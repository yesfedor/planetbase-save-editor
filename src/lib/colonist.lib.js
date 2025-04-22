const payload = {
  types: [],

  type: {
    Worker: {
      specialization: 'Worker',
    },
    Biologist: {
      specialization: 'Biologist',
    },
    Engineer: {
      specialization: 'Engineer',
    },
    Medic: {
      specialization: 'Medic',
    },
    Guard: {
      specialization: 'Guard',
    },
  },
}

payload.types = Object.keys(payload.type)

module.exports = payload
