class SurveyForm extends React.Component {
    survey: {questions: [], surveyName: ''}
    answers: []
    fieldType: ''

  saveSurveyName(name) {
    this.survey.surveyName = name
  }
  saveFieldType(type) {
    this.fieldType = type
  }
  addAnswer(answerOption) {
    this.answers.push(answerOption)
  }
  addQuestion(questionName) {
    if(this.fieldType == '')
      this.fieldType = 'radio'
    this.survey.questions.push({
      questionName: questionName,
      answers: this.answers,
      fieldType: this.fieldType
    })
    this.answers = []
  }
  saveSurvey(event) {
    event.preventDefault();
    $.post('/surveys', this.survey)
    surveysArray.unshift(this.survey)
    this.survey = {questions: [], surveyName: ''}
  }
  render() {
    return(
      <div>
        <form onSubmit={this.saveSurvey}>
          <SurveyName saveSurveyName={this.saveSurveyName}/>
          <Questions addQuestion={this.addQuestion}/>
          <FieldType saveFieldType={this.saveFieldType}/>
          <AnswerOption addAnswer={this.addAnswer}/>
          <SaveButton/>
        </form>
      </div>
    )
  }
}

class SurveyName extends React.Component {
  saveSurveyName(event) {
    this.props.saveSurveyName(event.target.value)
  }
  render() {
    return(
        <input name='surveyName' placeholder='Name'
                  onChange={this.saveSurveyName.bind(this)}/>
    )
  }
}

class Questions extends React.Component {
  constructor() {
  super() ;
    this.state = {
      questionName: ''
    }
  }
  saveQuestionName(event) {
    this.setState({
      questionName: event.target.value
    })
  }
  addQuestion() {
    this.props.addQuestion(this.state.questionName)
    this.setState({
      questionName: ''
    })
  }
  render() {
    return(
      <div style={{display: 'inline'}}>
        <input name='questionName' placeholder='Question'
            value={this.state.questionName}  onChange={this.saveQuestionName.bind(this)}/>
          <input type='button' value='Add question' onClick={this.addQuestion.bind(this)}/>
      </div>
    )
  }
}

class FieldType extends React.Component {
  saveFieldType(event) {
    this.props.saveFieldType(event.target.value)
  }
  render() {
    return(
      <select name='fieldType' onChange={this.saveFieldType.bind(this)}>
        <option value='radio'>radio</option>
        <option value='checkbox'>checkbox</option>
        <option value='text'>input</option>
      </select>
    )
  }
}

class AnswerOption extends React.Component {
  constructor() {
    super();
      this.state = {
        answerOption: ''
      };
  }
  saveAnswerOption(event) {
    this.setState({
      answerOption: event.target.value
    });
  }
  addAnswer() {
    this.props.addAnswer(this.state.answerOption)
    this.setState({
      answerOption:''
    })
  }
  render() {
    return(
      <div style={{display: 'inline'}}>
        <input name='answerOption' placeholder='Answer option'
                    value={this.state.answerOption} onChange={this.saveAnswerOption.bind(this)}/>
                  <input type='button' value='Add answer' onClick={this.addAnswer.bind(this)}/>
      </div>
    )
  }
}

class SaveButton extends React.Component{
  render() {
    return(
        <input type='submit' value='Save Survey'/>
    )
  }
}

class SurveysBox extends React.Component {
  render() {
    return(
        <SurveyForm/>
    );
  }
};
ReactDOM.render( <SurveysBox/>,
  document.getElementById('content')
)
