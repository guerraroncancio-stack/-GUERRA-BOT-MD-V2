// lib/mongoDB.js

import mongoose from 'mongoose'

const {
  Schema,
  connect,
  model,
  models
} = mongoose

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

/* =======================================================
   🌌 GUERRA BOT - MongoDB Principal
======================================================= */

export class mongoDB {
  constructor(
    url,
    options = defaultOptions
  ) {
    this.url = url
    this.options = options

    this.data = {}
    this._data = null
    this._schema = null
    this._model = null

    this.db = connect(
      this.url,
      {
        ...this.options
      }
    ).catch(console.error)
  }

  async read() {
    this.conn = await this.db

    const schema = new Schema({
      data: {
        type: Object,
        required: true,
        default: {}
      }
    })

    this._schema = schema

    this._model =
      models.data ||
      model('data', schema)

    this._data =
      await this._model.findOne({})

    if (!this._data) {

      this.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {}
      }

      await this.write(this.data)

      this._data =
        await this._model.findOne({})

    } else {

      this.data = this._data.data

    }

    return this.data
  }

  async write(data) {

    if (!data)
      throw new Error(
        '❌ Datos inválidos'
      )

    if (!this._data) {

      const newData =
        new this._model({
          data
        })

      await newData.save()

      this._data = newData

      return true
    }

    const doc =
      await this._model.findById(
        this._data._id
      )

    if (!doc)
      throw new Error(
        '❌ Documento no encontrado'
      )

    doc.data = data

    await doc.save()

    this.data = data

    return true
  }
}

/* =======================================================
   ⚡ MongoDB V2 Avanzado
======================================================= */

export class mongoDBV2 {

  constructor(
    url,
    options = defaultOptions
  ) {

    this.url = url
    this.options = options

    this.models = []
    this.data = {}

    this.lists = null
    this.list = null

    this.db = connect(
      this.url,
      {
        ...this.options
      }
    ).catch(console.error)
  }

  async read() {

    this.conn = await this.db

    const schema = new Schema({
      data: [{
        name: String
      }]
    })

    this.list =
      models.lists ||
      model('lists', schema)

    this.lists =
      await this.list.findOne({})

    if (!this.lists?.data) {

      await this.list.create({
        data: []
      })

      this.lists =
        await this.list.findOne({})
    }

    let garbage = []

    for (const { name }
      of this.lists.data) {

      let collection

      try {

        collection =
          models[name] ||
          model(
            name,
            new Schema({
              data: Array
            })
          )

      } catch (e) {

        console.error(e)

        garbage.push(name)

        continue
      }

      this.models.push({
        name,
        model: collection
      })

      const collectionsData =
        await collection.find({})

      this.data[name] =
        Object.fromEntries(
          collectionsData.map(v => v.data)
        )
    }

    /* =========================
       Limpieza de basura
    ========================== */

    try {

      const del =
        await this.list.findById(
          this.lists._id
        )

      del.data =
        del.data.filter(
          v => !garbage.includes(v.name)
        )

      await del.save()

    } catch (e) {
      console.error(e)
    }

    return this.data
  }

  async write(data) {

    if (!this.lists || !data)
      throw new Error(
        '❌ Datos inválidos'
      )

    const collections =
      Object.keys(data)

    const listDoc = []

    for (const key of collections) {

      let modelData =
        this.models.find(
          v => v.name === key
        )

      let doc

      if (modelData) {

        doc = modelData.model

      } else {

        const schema =
          new Schema({
            data: Array
          })

        doc =
          models[key] ||
          model(key, schema)

        this.models.push({
          name: key,
          model: doc
        })
      }

      await doc.deleteMany()
        .catch(console.error)

      const values =
        Object.entries(data[key])
          .map(v => ({
            data: v
          }))

      if (values.length)
        await doc.insertMany(values)

      listDoc.push({
        name: key
      })
    }

    /* =========================
       Guardar lista principal
    ========================== */

    const list =
      await this.list.findById(
        this.lists._id
      )

    list.data = listDoc

    await list.save()

    return true
  }
}
