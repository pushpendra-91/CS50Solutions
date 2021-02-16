document.addEventListener('DOMContentLoaded', function(e) {

    // Send the email to server upon clicking on submit
  document.querySelector('#compose-form').addEventListener('submit', (e) => submit_email(e));
    
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});


//Submit email after user composes an email and submits
function submit_email(e){

    //The default of submit is refreshing the button. 
    //If we don't prevent the default, the page refreshes 
    // and we are taken to Inbox instead of Sent
    e.preventDefault();

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
    })
    .then(response => response.json())
    .then(result => {
         console.log("result");
    })
    .catch(error => {
      console.log('Error:', error);
    });
    
    load_mailbox('sent');

};

function view_email(mailbox, li){
  const email_id = li.dataset.id;

  fetch(`/emails/${email_id}`)  
  .then(response => response.json())
  .then(email => {
    // Print email
    display_email_view(email, mailbox)
  });
}

//Create all the boxes of emails that user can click to get details of it.
function create_email_boxes(result, mailbox){
  const ul = document.createElement('ul');
  document.querySelector('#emails-view').append(ul);
  result.forEach(element => {


      const recipient = `<span class="email-sender">${element.recipients[0]}</span>`;
      const subject =  `<span class="email-subject">${element.subject}</span>`;
      const timestamp = `<span class="email-timestamp">${element.timestamp}</span>`;

      const li = document.createElement('li');
    

      //Add spans to li
      li.innerHTML += recipient;
      li.innerHTML +=  subject ;
      li.innerHTML += timestamp;

      // Add click event to display details of a particular email
      li.addEventListener("click", () => view_email(mailbox, li));

      // Append li to ul
      document.querySelector('ul').append(li);

      // Set id of that li to the email id
      li.setAttribute('data-id', `${element.id}`);

      // Make email gray if read
      if (element.read == true)
      {
        li.style.backgroundColor = "grey";
      }
  });
}

//Load mailbox (sent, inbox, archived) user wants to see
function load_mailbox_page(mailbox) {
    
    fetch(`/emails/${mailbox}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
         create_email_boxes(result, mailbox);
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

function add_button_logic(button, email)
{
  document.querySelector("#archive-email").style.visibility = 'visible';
  if (email.archived == true)
  {
    button.innerHTML = "Unarchive";
    button.setAttribute("class", "btn btn-dark");
  }
  else
  {
    button.innerHTML = "Archive";
    button.setAttribute("class", "btn btn-primary");
  }
}


function mark_email_as_read(email)
{
   //Mark email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function show_archive_button(email) {
    const button = document.querySelector("#archive-email");
    add_button_logic(button, email);
    

    button.addEventListener('click', (e) => {
      
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
          })
      })
      .then(() => {
        load_mailbox('inbox');
        window.location.reload();
        return false;
      })
  });
}

function hide_archive_button()
{
  document.querySelector("#archive-email").style.visibility = 'hidden';
}

function prefill_compose_email(email) {
  const recipient = email.sender 
  document.querySelector("#compose-recipients").value = recipient;

  const subject =  `Re: ${email.subject}`;
  document.querySelector("#compose-subject").value = subject;

  const timestamp = email.timestamp;
  const body = `On ${timestamp} ${recipient} wrote ${email.body}`;
  document.querySelector("#compose-body").value = body;
}


function display_email_view(email, mailbox) {


  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'block';
 
  //Grab current email's properties
  const display = document.querySelector('#display-view')
  const sender = email.sender;
  const recipient = email.recipients[0];
  const subject =  email.subject;
  const timestamp = email.timestamp;
  const body = email.body;
  

  let email_items = [sender, recipient, subject, timestamp, body];

  //Display current email's properties
  document.querySelectorAll("p").forEach((item, index) => {
        item.innerHTML = `${email_items[index]}`;
  })

  if (mailbox !== "sent")
  {
    show_archive_button(email)
    mark_email_as_read(email)
  }
  else 
  {
    hide_archive_button(); 
  }
 
  document.querySelector("#reply-email").addEventListener('click', () => compose_email(true, email));
 
}

function compose_email(prefillEmail = false, email = undefined) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (prefillEmail == false)
  {
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = '';
      document.querySelector('#compose-subject').value = '';
      document.querySelector('#compose-body').value = '';
  }
  else
  {  
      prefill_compose_email(email);
  }
  
}

function load_mailbox(mailbox) {  
  load_mailbox_page(mailbox);
  
  // Show the current mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}