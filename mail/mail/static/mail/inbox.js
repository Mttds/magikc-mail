document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email, false);

  document.querySelector('#error-view').style.display = 'none';

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  erroView = document.querySelector('#error-view');
  if (erroView.innerHTML === "" || erroView.innerHTML === undefined) {
    erroView.style.display = 'none';
  }

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  console.log(`Loading ${mailbox}`);
  
  // Show the mailbox and hide other views
  const emailsView = document.querySelector('#emails-view');
  emailsView.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'none';

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      // if no emails in the array then show no e-mails to view div and return
      if (emails.length === 0) {
        let divRow = document.createElement('div');
        divRow.innerHTML = "No e-mails to view!";
        divRow.className = 'alert alert-info';
        emailsView.appendChild(divRow);
        return;
      }

      emails.forEach(element => {        
        let link = document.createElement('a');
        let archiveButton = document.createElement('button');
        let markReadUnreadButton = document.createElement('button');

        let divContainer = document.createElement('div');
        let divRow = document.createElement('div');
        let divRowButton = document.createElement('div');
        let divLink = document.createElement('div');

        // grey if e-mail was read, otherwise blue
        if (element.read)
          divRow.className = 'row alert alert-secondary';
        else {
          divRow.className = 'row alert alert-info';
        }

        divRowButton.className = 'row';

        let divRecipientCol = document.createElement('div');
        let divSubjectCol = document.createElement('div');
        let divTimestampCol = document.createElement('div');
        divRecipientCol.className = 'col';
        divSubjectCol.className = 'col';
        divTimestampCol.className = 'col';

        archiveButton.className = 'btn btn-info col';
        archiveButton.innerHTML = mailbox === "inbox" ? 'Archive' : 'Unarchive';
        archiveButton.addEventListener('click', () => update_email(element.id, mailbox === "inbox" ? {archived: true} : {archived: false}, mailbox));
        markReadUnreadButton.className = 'btn btn-info col';
        markReadUnreadButton.innerHTML = element.read ? 'Mark as unread' : 'Mark as read';
        markReadUnreadButton.addEventListener('click', () => update_email(element.id, {read: !element.read}, mailbox));

        divRecipientCol.style.textAlign = 'left';
        divSubjectCol.style.textAlign = 'left';
        divTimestampCol.style.textAlign = 'right';

        divRecipientCol.innerHTML = mailbox !== "sent" ?
          `<b>From:</b> ${element.sender}` : `<b>To:</b> ${element.recipients}`;
        
        divSubjectCol.innerHTML = `<b>Subject:</b> ${element.subject}`;
        divTimestampCol.appendChild(document.createTextNode(`${element.timestamp}`));

        divRow.appendChild(divRecipientCol);
        divRow.appendChild(divSubjectCol);
        divRow.appendChild(divTimestampCol);

        if(mailbox !== "sent") {
          divRowButton.appendChild(archiveButton);
          divRowButton.appendChild(markReadUnreadButton);
        }

        link.appendChild(divRow);
        link.addEventListener('click', () => view_email(element.id));
        divLink.appendChild(link);
        divContainer.appendChild(divRowButton);
        divContainer.appendChild(divLink);
        emailsView.appendChild(divContainer);
      });
    });
}

function view_email(id) {
  // hide other elements
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'none';

  emailView = document.querySelector('#email-view');
  emailView.style.display = 'block';

  // set email read property as true
  update_email(id, {read: true});

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      emailView.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="container">
              <div class="row"><div class="col-sm-1"><b>From:</b></div><div class="col-sm-10">${email.sender}</div></div>
              <div class="row"><div class="col-sm-1"><b>To:</b></div><div class="col-sm-10">${email.recipients}</div></div>
              <div class="row"><div class="col-sm-1"><b>Date:</b></div><div class="col-sm-10">${email.timestamp}</div></div>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${email.subject}</h5>
            ${email.body}<br/><br/>
            <button id="reply-button" type="submit" class="btn btn-primary w-25">Reply</button>
          </div>
        </div>`

      document.querySelector('#reply-button').addEventListener('click', () => reply_email(email));
    });
}

function reply_email(email) {
  compose_email();
  let sbj = email.subject.startsWith('Re:') ? `${email.subject}` : `Re: ${email.subject}`
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = sbj;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
}

function update_email(id, payload, mailbox) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
    .then(() => {if (mailbox !== undefined) {
      load_mailbox(mailbox)
    }})
    .catch((error) => {
      console.log(error)
    });
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  }).then(response => {
      // if the e-mail was not sent (status not 201)
      response.json().then(data => {
        //console.log(response.status);
        //console.log(data);
        if (response.status !== 201) {
          // set the #error-view div to be displayed with the error
          // returned by the API
          document.querySelector('#error-view').style.display = 'block';
          document.querySelector('#error-view').innerHTML = data.error;
        } else {
          // otherwise we can load the sent mailbox
          load_mailbox('sent');
        }
      })
    })
    .catch((error) => {
      console.log(error);
    });
}