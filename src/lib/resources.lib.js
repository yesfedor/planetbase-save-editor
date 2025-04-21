const payload = {
  types: [],

  // additional info
  type: {
    // Металл
    Metal: {},
    // Биопластик
    Bioplastic: {},
    // Еда
    Meal: {},
    // Алкогольный напиток
    AlcoholicDrink: {},
    // Медицинские принадлежности
    MedicalSupplies: {},
    // Оружие
    Gun: {},
    // Крахмал
    Starch: {},
    // Лекарственные растения
    MedicinalPlants: {},
    // Руда
    Ore: {},
    // Запчасти
    Spares: {},
    // Полупроводники
    Semiconductors: {},
  },
}

payload.types = Object.keys(payload.type)

module.exports = payload
