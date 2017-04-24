#!/usr/bin/env node

const MapboxClient = require('mapbox')
const path = require('path')
const fs = require('fs')
const ProgressBar = require('progress')

require('dotenv').config()

const argv = process.argv.slice(2)
const filepath = path.join(process.cwd(), argv[0])

const client = new MapboxClient(process.env.MAPBOX_TOKEN)

var AWS = require('aws-sdk')

var uploadBar = createProgressBar('uploading')
var processBar

client.createUploadCredentials(function (err, credentials) {
  if (err) return onError(err)
  // Use aws-sdk to stage the file on Amazon S3
  var s3 = new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    region: 'us-east-1'
  })
  s3.putObject({
    Bucket: credentials.bucket,
    Key: credentials.key,
    Body: fs.createReadStream(filepath, 'utf8')
  }, function (err, resp) {
    if (err) return onError(err)
    client.createUpload({
      tileset: ['gmaclennan', 'alianza-areas'].join('.'),
      url: credentials.url,
      name: 'alianza-areas'
    }, function (err, upload) {
      processBar = createProgressBar('processing')
      monitorUpload(err, upload)
    })
  }).on('httpUploadProgress', progress => uploadBar.tick(progress.loaded / progress.total))
})

function monitorUpload (err, upload) {
  if (err) return onError(err)
  if (upload.error) return onError(upload.error)
  if (upload.progress === 1) return
  processBar.tick(upload.progress)
  setTimeout(() => client.readUpload(upload.id, monitorUpload), 200)
}

function onError (err) {
  console.error(err)
  process.exit(1)
}

function createProgressBar (task) {
  return new ProgressBar('  ' + task + ' [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 1
  })
}
