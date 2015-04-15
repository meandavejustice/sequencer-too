var Form = require("multiparty").Form;

module.exports = function (req, res, opts, cb) {
  var form = new Form();
  var fields = {};
  var files = {};
  var result = {
    fields: fields,
    files: files
  };
  var counter = 1;
  form.parse(req);

  form.on("field", function (key, value) {
    // BUG: do not handle case where name appears multiple
    // times in a form.
    fields[key] = value;
    console.log('on field', fields, value);
  });

  form.on("part", function (part) {
    if (part.filename === null) {
      return;
    }

    counter++;

    opts.handlePart.call(result, part, function (err, result) {
      if (err) {
        return cb(err);
      }

      files[part.name] = result;
      finish();
    });
  });

  function finish() {
    if (--counter === 0) {
      cb(null, {fields: fields, files: files});
    }
  }

  form.once("error", cb);
  form.once("close", finish);
};
