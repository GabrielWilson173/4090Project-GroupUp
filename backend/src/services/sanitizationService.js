function removeEscape(str)
{
    nStr = String(str)
        .replace(/&/g, "")
        .replace(/>/g, "")
        .replace(/</g, "")
        .replace(/"/g, "")
        .replace(/'/g, "");
    return nStr;
};

function sanitizeString(req)
{
  console.log('Sanitize Begin');
  const { name, email, password } = req.body;
  const sanReq = {
    name     : removeEscape(name).trim(),
    email    : removeEscape(email).trim(),
    password : removeEscape(password).trim(),
  };
  console.log(sanReq);
};
