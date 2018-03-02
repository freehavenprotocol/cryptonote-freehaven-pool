fs = require('fs');

var mailgun = require('mailgun.js');
var logSystem = 'email';

// Sends out an email using the mailgun API.
exports.sendEmail = function(email, subject, template, variables) {
    if (!config.email.enabled || !email) return;
    if (!config.email.templates) return ;

    var allow_template = false;
    for (var i = 0; i <= config.email.templates.length; i++) {
        if (config.email.templates[i] == template) {
            allow_template = true;
	    break;
	}
    }
    if (!allow_template) return ;
    
    var api_key = config.email.api_key;
    var api_domain = config.email.api_domain;
    var mg = mailgun.client({username: 'api', key: api_key});

    var body = getEmailTemplate(template);
    
    var replacement = [
      [/%POOL_HOST%/g, config.email.domain],
    ];
    
    if (variables) {
      for (var varName in variables) {
	replacement.push([new RegExp('%'+varName+'%', 'g'), variables[varName]]);
      }
    }
    
    for (var i = 0; i < replacement.length; i++) {
      body = body.replace(replacement[i][0], replacement[i][1]);
      subject = subject.replace(replacement[i][0], replacement[i][1]);
    }
    body = body.replace(/  /, ' ');
    subject = subject.replace(/  /, ' ');

    mg.messages.create(api_domain, {
      from: config.email.from_address,
      to: email,
      subject: subject,
      text: body
    });
    log('info', logSystem, 'E-Mail sent to %s with subject: %s', [email, subject]);
};

// Reads an email template file and returns it.
function getEmailTemplate(template_name) {
  var content = fs.readFileSync(config.email.template_dir + '/' + template_name, 'utf8');
  return content;
};
