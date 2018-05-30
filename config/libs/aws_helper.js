// Load the SDK and UUID
var AWS = require('aws-sdk');
var path = require('path');
const config  = require('../config');
var fs = require('fs');
var util = require('util');

// Create an S3 client
var s3 = new AWS.S3();

var myConfig = new AWS.Config({
  region: config.aws_region
});

var bucketName = config.aws_bucket_name;


function putObject(rawfile,foldername,filename,done){

  //const file=path.join(__dirname, 'app','public','design.jpg');
  var photoKey = foldername+'/'+filename;

  fs.readFile(rawfile.path, function(err, data) {
      if(!err){
        s3.upload({
          Bucket: bucketName,
          Key: photoKey,
          Body: data,
          ACL: 'public-read'
        }, function(err, data) {
          if (err) {
            console.log('There was an error uploading your photo: '+ err);
            return done(false);
          }
          console.log('Successfully uploaded photo.');
          //console.log('Successfully uploaded photo.'+util.inspect({data:data}));

          return done(true,data);
        });
      }else{
        console.log('Error reading file from storage.='+err);
        return done(false);
      }
    });

}


function deleteObject(fileurl,done){
  //https://rahulecommercetest.s3.ap-south-1.amazonaws.com/categories/1527343039341.jpg
  //const file=path.join(__dirname, 'app','public','design.jpg');
  var photoKey = fileurl.substring(fileurl.lastIndexOf("amazonaws.com")+14);
  console.log('decoded photo key='+photoKey);
  var params = {
  Bucket: bucketName,
  Key: photoKey
 };
 s3.deleteObject(params, function(err, data) {
   if (err){
     done(false,data);
   }
   else {
     done(true);   // successful response
   }

 });
}

module.exports.deleteObject=deleteObject;
module.exports.putObject=putObject;
