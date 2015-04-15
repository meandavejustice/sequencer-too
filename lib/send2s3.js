var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
AWS.config.httpOptions = {timeout: 5000};
var awsS3 = new AWS.S3();
var Uploader = require('s3-upload-stream').Uploader;


module.exports = uploadHandler;

function uploadHandler(part, prefix, cb) {
  var contentType = "audio/mpeg";

  if (!~part.headers['content-type'].indexOf('wav')) {
    contentType = part.headers['content-type'];
  }

  var upload = new Uploader({s3Client: awsS3},  {
    "Bucket": "noisey-bits",
    "ACL": "public-read",
    "Key": prefix + part.filename,
    "ContentType": contentType
  }, function(err, stream) {
       if (err) {
         console.log(err);
       } else {
         stream.on('chunk', function(chunkdata) {
           console.log('s3 upload part:::', chunkdata);
         })

         stream.on('error', function(err) {
           console.log('s3 error:::', err);
         })

         stream.on('uploaded', function(details) {
           console.log('uploaded:::', details);
           cb(null, prefix + part.filename);
         });

         part.pipe(stream);
       }
     }).concurrentParts(5);
};