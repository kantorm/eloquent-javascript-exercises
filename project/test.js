function Survey(name) {
  this.name = name;
  this.questions = [];
}

var que = new Survey();

var fieldsWraper = document.createElement('div');

function generateFields() {
    if(fieldsWraper == undefined)
      var fieldsWraper = document.createElement('div');
    document.body.appendChild(fieldsWraper);

    var nameInput = document.createElement('input');
    if(que.name == undefined || que.name == "")
      nameInput.placeholder = "NAME";
    else
        nameInput.value = que.name
    fieldsWraper.appendChild(nameInput);

    var questionInput = document.createElement('input')
    questionInput.placeholder = "QUESTION";
    fieldsWraper.appendChild(questionInput);

    var fieldTypeSelect = document.createElement('select');

    var checkbox = document.createElement('option');
    checkbox.value = 'checkbox'
    checkbox.textContent = 'checkbox';

    var radio = document.createElement('option');
    radio.value = 'radio';
    radio.textContent = 'radio';

    var input = document.createElement('option');
    input.value = 'input';
    input.textContent = 'input';

    fieldTypeSelect.appendChild(radio)
    fieldTypeSelect.appendChild(checkbox);
    fieldTypeSelect.appendChild(input);
    fieldsWraper.appendChild(fieldTypeSelect);

    var answerInput = document.createElement('input');
    answerInput.placeholder = "ANSWER";
    fieldsWraper.appendChild(answerInput);

    var answersToAdd = [];

    var addAnswerButton = document.createElement('button');
    addAnswerButton.textContent = 'add answer';
    fieldsWraper.appendChild(addAnswerButton);

    var addQuestionButton = document.createElement('button');
    addQuestionButton.textContent = 'add question';
    fieldsWraper.appendChild(addQuestionButton);

    addAnswerButton.addEventListener('click', function() {
      answersToAdd.push(answerInput.value);
      answerInput.value = "";
    });

    addQuestionButton.addEventListener('click', function() {
      if(que.name == undefined) {
        que.name = nameInput.value;
      }
      var choose = fieldTypeSelect.value;
      que.questions.push({question: questionInput.value, answers: answersToAdd, type: choose});

      answersToAdd = [];
      answerInput.value = "";

      var newLine = document.createElement('br');
      document.body.appendChild(newLine);

      console.log(que)
      generateFields();
    });
}

    var generate = document.createElement('button');
    generate.textContent = 'generate';
    document.body.appendChild(generate);

    generate.addEventListener('click', function () {
        var container = document.createElement('div');
        var form = document.createElement('form');

        document.body.appendChild(container);
        container.appendChild(form);

        var header = document.createElement('h1');
        header.textContent = que.name;
        form.appendChild(header);

        que.questions.forEach(function(question) {
          var questionHeader = document.createElement('h3');
          questionHeader.textContent = question.question;
          form.appendChild(questionHeader);
          var type = question.type;

          question.answers.forEach(function(answer) {
            var label = document.createElement('label');
            label.textContent = answer;

            var answerOption = document.createElement('input');
            answerOption.type = type;
            answerOption.name = questionHeader.textContent;
            answerOption.value = answer;

            label.appendChild(answerOption);
            form.appendChild(label);
          });
        });
        var submitButton = document.createElement('input');
        submitButton.type = 'submit';
        submitButton.value = 'submit';
        form.appendChild(submitButton);

        sessionStorage.setItem(que.name, JSON.stringify(que));
        que = new Survey();
        fieldsWraper.remove();

        generateFields()
});
generateFields()
