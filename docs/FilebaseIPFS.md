# Pinning Files

This guide will walk you through the process of pinning files to IPFS using Filebase. We offer three methods for pinning files: our JavaScript SDK, our S3 Compatible API, and our web application dashboard. Choose the method that best suits your needs.

### Using the JavaScript SDK

#### Installation

First, you need to install the Filebase SDK. You can do this using npm:

```bash
npm install @filebase/sdk
```

#### Uploading a File

Once you have the SDK installed, you can use it to pin files to IPFS. Here’s a simple example to get you started

```javascript
import { ObjectManager } from "@filebase/sdk";
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});

const uploadedObject = await objectManager.upload(
  "my-object",
  Buffer.from("Hello World!")
);

console.log(uploadedObject);
```

#### API Reference

* `S3_KEY` and `S3_SECRET`: Your Filebase API credentials.
* `objectManager.upload()`: Pins the provided file to IPFS.

#### Uploading a Folder

You can also use the Filebase SDK to upload a folder. This will result in an IPFS folder being created.

```javascript
import { ObjectManager } from "@filebase/sdk";
const fs = require('fs');
const rfs = require('recursive-fs');
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});

var filesArray = [];
var path = 'my-folder';
var {files} = await rfs.read(path)
files.forEach(file => {
    filesArray.push({path: file, content: fs.createReadStream(file)})
})

const uploadedObject = await objectManager.upload("my-first-directory", filesArray);
console.log(uploadedObject);
```

For more details, refer to the [Filebase SDK documentation](https://filebase.github.io/filebase-sdk/).

### Using the S3 Compatible API

#### Authentication

Before you can start pinning files using the S3 Compatible API, you need to authenticate using your API key and secret.

#### Uploading a File

You can upload and pin files using standard S3 operations. Here’s an example using the AWS SDK for JavaScript:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  signatureVersion: 'v4',
  accessKeyId: 'YOUR_API_KEY',
  secretAccessKey: 'YOUR_API_SECRET',
});

const params = {
  Bucket: 'YOUR_BUCKET_NAME',
  Key: 'path/to/your/file',
  Body: fs.readFileSync('path/to/your/file'),
};

const request = s3.putObject(params);
request.on('httpHeaders', (statusCode, headers) => {
    console.log(`CID: ${headers['x-amz-meta-cid']}`);
});
request.send();
```

#### API Reference

* `endpoint`: Filebase S3 Compatible API endpoint.
* `Bucket`: The name of your S3 bucket.
* `Key`: The path where the file will be stored.
* `Body`: The file content.

For more details, refer to the [Filebase S3 API documentation](https://docs.filebase.com/api-documentation/s3-compatible-api).

### Using the Web Application Dashboard

#### Step-by-Step Guide

1. **Login**: Start by logging into your Filebase account.
2. **Navigate to the Buckets page**: Once logged in, select Buckets from the menu on the left.\
   ![](https://3861818989-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-Lyjw7dWpiQtUFDa1pO0%2Fuploads%2FgmwfTTIjmxWHn5xEkP7s%2Fimage.png?alt=media\&token=9a8427c5-2720-4dd8-a79f-caece519a4ea)
3. **Select Your Bucket**: Choose the bucket where you want to pin your files.\
   ![](https://3861818989-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-Lyjw7dWpiQtUFDa1pO0%2Fuploads%2FbSmcChITVpy3Pi2Qd0GS%2Fimage.png?alt=media\&token=e001d7dd-af00-4097-9f2c-c2e30aae5ff8)
4. **Upload Files**: Click on the "Upload" button and select the files you want to pin.\
   ![](https://3861818989-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-Lyjw7dWpiQtUFDa1pO0%2Fuploads%2FWoWtEjypECHG3jAHf63G%2Fimage.png?alt=media\&token=bce13744-6091-49a9-a8ba-a16f3b0b39a0)

#### Tips

* Ensure your files are named appropriately before uploading.
* You can monitor the pinning status directly from the dashboard.

###
# Listing Files

This guide will show you how to list files pinned to IPFS using Filebase. We offer three methods for listing files: our JavaScript SDK, our S3 Compatible API, and our web application dashboard. Choose the method that best suits your needs.

### Using the JavaScript SDK

#### Installation

First, you need to install the Filebase SDK. You can do this using npm:

```bash
npm install @filebase/sdk
```

#### Usage

Once you have the SDK installed, you can use it to list files pinned to IPFS. Here’s a simple example to get you started:

```javascript
import { ObjectManager } from "@filebase/sdk";
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});

const fileList = await objectManager.list({
  MaxKeys: 1000
});

console.log(fileList);
```

#### API Reference

* `S3_KEY` and `S3_SECRET`: Your Filebase API credentials.
* `objectManager.list()`: List the files in the specified bucket.

For more details, refer to the [Filebase SDK documentation](https://filebase.github.io/filebase-sdk/global.html#listObjectOptions).

### Using the S3 Compatible API

#### Authentication

Before you can start listing files using the S3 Compatible API, you need to authenticate using your API key and secret.

#### Listing Files

You can list files using standard S3 operations. Here’s an example using the AWS SDK for JavaScript:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  signatureVersion: 'v4',
  accessKeyId: 'YOUR_API_KEY',
  secretAccessKey: 'YOUR_API_SECRET',
});

const params = {
  Bucket: 'YOUR_BUCKET_NAME',
};

s3.listObjectsV2(params, (err, data) => {
  if (err) {
    console.error('Error listing files:', err);
  } else {
    console.log('Files listed successfully:', data.Contents);
  }
});
```

#### API Reference

* `endpoint`: Filebase S3 Compatible API endpoint.
* `Bucket`: The name of your S3 bucket.

For more details, refer to the [Filebase S3 API documentation](https://docs.filebase.com).

### Using the Web Application Dashboard

#### Step-by-Step Guide

1. **Login**: Start by logging into your Filebase account.
2. **Navigate to the Dashboard**: Once logged in, navigate to the dashboard.
3. **Select Your Bucket**: Choose the bucket from which you want to list the files.
4. **View Files**: The files pinned to IPFS will be displayed in the dashboard. You can browse through them as needed.
# Deleting Files

This guide will show you how to delete files pinned to IPFS using Filebase. We offer three methods for deleting files: our JavaScript SDK, our S3 Compatible API, and our web application dashboard. Choose the method that best suits your needs.

### Using the JavaScript SDK

#### Installation

First, you need to install the Filebase SDK. You can do this using npm:

```bash
npm install @filebase/sdk
```

#### Usage

Once you have the SDK installed, you can use it to delete files from IPFS. Here’s a simple example to get you started:

```javascript
import { ObjectManager } from "@filebase/sdk";
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});

await objectManager.delete(`delete-object-example`);
```

#### API Reference

* `S3_KEY` and `S3_SECRET`: Your Filebase API credentials.
* `objectManager.delete()`: Delete the specified file from the bucket.

For more details, refer to the [Filebase SDK documentation](https://filebase.github.io/filebase-sdk/ObjectManager.html#delete).

### Using the S3 Compatible API

#### Authentication

Before you can start deleting files using the S3 Compatible API, you need to authenticate using your API key and secret.

#### Deleting a File

You can delete files using standard S3 operations. Here’s an example using the AWS SDK for JavaScript:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  signatureVersion: 'v4',
  accessKeyId: 'YOUR_API_KEY',
  secretAccessKey: 'YOUR_API_SECRET',
});

const params = {
  Bucket: 'YOUR_BUCKET_NAME',
  Key: 'path/to/your/file',
};

s3.deleteObject(params, (err, data) => {
  if (err) {
    console.error('Error deleting file:', err);
  } else {
    console.log('File deleted successfully:', data);
  }
});
```

#### API Reference

* `endpoint`: Filebase S3 Compatible API endpoint.
* `Bucket`: The name of your S3 bucket.
* `Key`: The path of the file to be deleted.

For more details, refer to the [Filebase S3 API documentation](https://docs.filebase.com).

### Using the Web Application Dashboard

#### Step-by-Step Guide

1. **Login**: Start by logging into your Filebase account.
2. **Navigate to the Dashboard**: Once logged in, navigate to the dashboard.
3. **Select Your Bucket**: Choose the bucket from which you want to delete the files.
4. **Delete Files**: Click on the "Delete" button next to the file you wish to remove.

#### Tips

* Ensure you have selected the correct files before deleting.
* Deleted files cannot be recovered, so double-check before confirming.
# Deleting Files

This guide will show you how to delete files pinned to IPFS using Filebase. We offer three methods for deleting files: our JavaScript SDK, our S3 Compatible API, and our web application dashboard. Choose the method that best suits your needs.

### Using the JavaScript SDK

#### Installation

First, you need to install the Filebase SDK. You can do this using npm:

```bash
npm install @filebase/sdk
```

#### Usage

Once you have the SDK installed, you can use it to delete files from IPFS. Here’s a simple example to get you started:

```javascript
import { ObjectManager } from "@filebase/sdk";
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});

await objectManager.delete(`delete-object-example`);
```

#### API Reference

* `S3_KEY` and `S3_SECRET`: Your Filebase API credentials.
* `objectManager.delete()`: Delete the specified file from the bucket.

For more details, refer to the [Filebase SDK documentation](https://filebase.github.io/filebase-sdk/ObjectManager.html#delete).

### Using the S3 Compatible API

#### Authentication

Before you can start deleting files using the S3 Compatible API, you need to authenticate using your API key and secret.

#### Deleting a File

You can delete files using standard S3 operations. Here’s an example using the AWS SDK for JavaScript:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  signatureVersion: 'v4',
  accessKeyId: 'YOUR_API_KEY',
  secretAccessKey: 'YOUR_API_SECRET',
});

const params = {
  Bucket: 'YOUR_BUCKET_NAME',
  Key: 'path/to/your/file',
};

s3.deleteObject(params, (err, data) => {
  if (err) {
    console.error('Error deleting file:', err);
  } else {
    console.log('File deleted successfully:', data);
  }
});
```

#### API Reference

* `endpoint`: Filebase S3 Compatible API endpoint.
* `Bucket`: The name of your S3 bucket.
* `Key`: The path of the file to be deleted.

For more details, refer to the [Filebase S3 API documentation](https://docs.filebase.com).

### Using the Web Application Dashboard

#### Step-by-Step Guide

1. **Login**: Start by logging into your Filebase account.
2. **Navigate to the Dashboard**: Once logged in, navigate to the dashboard.
3. **Select Your Bucket**: Choose the bucket from which you want to delete the files.
4. **Delete Files**: Click on the "Delete" button next to the file you wish to remove.

#### Tips

* Ensure you have selected the correct files before deleting.
* Deleted files cannot be recovered, so double-check before confirming.
