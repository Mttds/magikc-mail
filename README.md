# Magikc Mail

E-mail application built with Django, Bootstrap and JavaScript. The Django server acts as a fake mailserver storing the e-mails in its database and provides an API for the front-end built as a SPA with Javascript.

## Install requirements

pip install -r requirements.txt

## Run server

python manage.py runserver 127.0.0.1:8001

## API

### GET
GET /emails/<str:mailbox>
Sending a GET request to /emails/<mailbox> where <mailbox> is either inbox, sent, or archive will return a JSON list of all emails in that mailbox, in reverse chronological order. Available mailboxes are inbox, archive, sent:

```
[
    {
        "id": 100,
        "sender": "foo@example.com",
        "recipients": ["bar@example.com"],
        "subject": "Hello!",
        "body": "Hello, world!",
        "timestamp": "Jan 2 2020, 12:00 AM",
        "read": false,
        "archived": false
    },
    {
        "id": 95,
        "sender": "baz@example.com",
        "recipients": ["bar@example.com"],
        "subject": "Meeting Tomorrow",
        "body": "What time are we meeting?",
        "timestamp": "Jan 1 2020, 12:00 AM",
        "read": true,
        "archived": false
    }
]
```

GET /emails/<int:email_id>
Sending a GET request to /emails/email_id where email_id is an integer id for an email will return a JSON representation of the email:

```
{
    "id": 100,
    "sender": "foo@example.com",
    "recipients": ["bar@example.com"],
    "subject": "Hello!",
    "body": "Hello, world!",
    "timestamp": "Jan 2 2020, 12:00 AM",
    "read": false,
    "archived": false
}
```
### POST
POST /emails
To send an email, a POST request to the /emails route can be made. The route requires three pieces of data to be submitted: a recipients value (a comma-separated string of all users to send an email to), a subject string, and a body string.

```
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: 'baz@example.com',
      subject: 'Meeting time',
      body: 'How about we meet tomorrow at 3pm?'
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
});
```

If the email is sent successfully, the route will respond with a 201 status code and a JSON response of {"message": "Email sent successfully."}.

### PUT

PUT /emails/<int:email_id>
A PUT request to /emails/<email_id> where email_id is the id of the email will modify the specified e-mail according the the provided payload.

```
fetch('/emails/100', {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
```