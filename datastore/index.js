const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, () => {
      callback(null, { id, text });
    });
  });
};

exports.readAll = (callback) => {
  // fs.readdir(exports.dataDir, (err, files) => {
  //   callback(null, files.map(file => ({ id: file.slice(0, -4), text: file.slice(0, -4) })))
  // })

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      return callback(err);
    }
    var promises = files.map((file) => {
      return readFilePromise(path.join(exports.dataDir, file)).then(fileData => {
        return {
          id: file.slice(0, -4),
          text: fileData.toString()
        };
      });
    });
    Promise.all(promises)
      .then((list) => {
        callback(null, list);
      }, (err) => { callback(err); });

  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', (err, text) => {
    callback(err, { id, text });
  })
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.access(filePath, (err) => {
    if (err) {
      callback(err, null);
    } else {
      fs.writeFile(filePath, text, () => {
        callback(null, { id, text });
      });
    }

  })
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    callback(err);
  })
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
