import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Result from './result';
import data from './data';
import {Auth} from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'

class Game extends React.Component{
	
	constructor() {
    super();
    this.state = {guesses: "10",
	currentUser:'',
	letter1:'',
	letter2:'',
	letter3:'',
	letter4:'', 
	pastGuess:[],
	words:data,
	wordToGuess:'',
 	showSuccess:false, 
	validWord:true,
	collapseMenu: true,
	showModal:false};
	this.handleChange = this.handleChange.bind(this);
	this.submitWord = this.submitWord.bind(this);
	this.clearWord = this.clearWord.bind(this);
	this.newGame = this.newGame.bind(this);
	this.handleShow = this.handleShow.bind(this);
	this.handleClose = this.handleClose.bind(this);
	}
	
	componentDidMount =() =>{
		this.newGame();
		Auth.currentAuthenticatedUser()
    .then(user => this.setState({currentUser:user.username}))
    .catch(err => console.log(err));
	
	}
	
   newGame(){
	  alert('Start New Game');
	  this.setState({guesses: "10",
	letter1:'',
	letter2:'',
	letter3:'',
	letter4:'', 
	pastGuess:[],
	wordToGuess:this.state.words[Math.floor(Math.random() * this.state.words.length)], 
	showSuccess:false,
	showModal:false});
	document.querySelector('input[id=letter1').focus();
	console.log("word to guess "+this.state.wordToGuess);
  }
  clearWord(){
	  this.setState({letter1:'',
	   letter2:'',
	   letter3:'',
	   letter4:''});
	   document.querySelector('input[id=letter1]').focus();
  }
  submitWord(event){
      this.setState({validWord:true});
	  let word = this.state.letter1+this.state.letter2+this.state.letter3+this.state.letter4;
	  word=word.toUpperCase();
	  if(word===this.state.wordToGuess){
		  this.setState({showSuccess:true});
		  return;
	  }
	  //validate word
	  const headers = {  
						'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
						'x-rapidapi-key': '2fc9416d4bmsh03c0ee660d271a9p1e4581jsn0a9ffa0d3542' }
	  let url='https://wordsapiv1.p.rapidapi.com/words/'+word+'/definitions';
	  console.log(url);
	     (async () => {
		  try{
			  const resp = await fetch(url, {  headers });
			  //  .then(response => response.json())
				//.then(data => {this.setState({ responseData: data.definitions });
					//			console.log("1111"+data.definitions);
						//});
				console.log(resp.status);			
				const json = await resp.json();
				console.log(json);
				if(resp.status===404)
				{
					//alert('Enter a valid word !');
					this.handleShow();
					this.clearWord();
					return;
				}else{
					 //calculate result 
							let index = 0;
							let cows = 0;
							let bulls = 0;
							let correctWord = this.state.wordToGuess;
							String.prototype.replaceAt = function(index, replacement) {
								return this.substr(0, index) + replacement + this.substr(index + replacement.length);
							}
							while (index < 4) {
								if(word.charAt(index)===correctWord.charAt(index)){
									correctWord=correctWord.replaceAt(index,'*');
									//alert(correctWord);
									bulls++;
								}
								else{
									if(correctWord.indexOf(word.charAt(index))>-1)
										cows++;
								}
								index++;	
							}
					//save in history		
					var newWord= {id:this.state.guesses,
	                word:word,cows:cows,bulls:bulls};
				  this.setState({guesses:parseInt(this.state.guesses,10)-1});
				  var newArray=this.state.pastGuess.slice();
				  newArray.push(newWord);
				  this.setState({pastGuess:newArray});
				  this.clearWord();
				   
				  console.log(this.state.pastGuess);
				}
				
				  
			} catch (err) {
				console.error('err', err);
			  }		
		 
		})();
	   
	 
  }
  handleChange(event){
	  if(event.target.value.length === 1 && event.target.value.match(/[a-z]/i)){
			  this.setState({[event.target.id]:event.target.value});
			  var lastChar = event.target.id.substr(event.target.id.length - 1);
			  var nextId = parseInt(lastChar,10)+1;
			  var nextSibling = '';

			  if(nextId===5){
				nextSibling = document.querySelector('button[id=submit]');  
			  }else{
				nextSibling = document.querySelector('input[id=letter'+nextId+']');
			  }
			  if (nextSibling !== null) {
						nextSibling.focus();
					  } 
		}else  {
			//alert('Please enter an alphabet.');
			this.setState({[event.target.id]:''});
		}
  }
	
  handleClose(){
		this.setState({showModal:false});
		 document.querySelector('input[id=letter1]').focus();
 }
  handleShow(){
	  this.setState({showModal:true});
  }
   showHide =(e)=>{
    e.preventDefault();

    this.setState({
      collapseMenu: !this.state.collapseMenu
    });
  }
  render() {
	   
	  let message;
	  	if(this.state.showSuccess)
			message = <Alert variant="success">You Won!</Alert>;
		else{
			if(this.state.guesses===0)
				message = <Alert variant="warning">You Lost! The correct word was {this.state.wordToGuess}!</Alert>; 
			
		}
	return (
		<Container className="text-center" style={{backgroundColor:'#FAA852'}}>
		<Row>
		<Col><h3 class="text-secondary">Hello {this.state.currentUser}!</h3></Col>
		<Col><AmplifySignOut /></Col>
		</Row>
		<Row>
			<Col>
			 <h2 class="text-success">Cows and Bulls</h2> 
	      <button
        onClick={this.showHide}
        aria-controls="example-collapse-text"
        aria-expanded="false"
		class="btn btn-primary btn-sm mr-3  btn-space"
      >
        Instructions
      </button>&nbsp;&nbsp;
	   <button onClick={this.newGame} class="btn btn-success btn-sm mr-3  btn-space">New Game</button> 
		 <br/>
		 <br/>
      <Collapse in={!this.state.collapseMenu}>
        <div id="example-collapse-text">
           Try to guess the word. Number of Bulls shows the number of letters in the correct 
				position and number of Cows shows the number of letters in the wrong position.
        </div>
      </Collapse>
	 
	  
		 </Col>
		 </Row>
		 <Row>
		 <Col> 
   
		<Alert variant="success">Number of guesses left : {this.state.guesses} </Alert>
		<Result word={this.state.wordToGuess}/>
			{message}
		<input 
			type="text" 
			id="letter1" 
			maxLength="1" 
			value={this.state.letter1} 
			onChange={this.handleChange}
			style={{width:50,margin:3,fontSize:50}}
			 autoFocus
         />
		 <input
            type="text"
			id="letter2"
			maxLength="1"
            value={this.state.letter2}
            onChange={this.handleChange}
			style={{width:50,margin:3,fontSize:50}}
         />
		 <input
            type="text"
			id="letter3"
			maxLength="1"
            value={this.state.letter3}
			style={{width:50,margin:3,fontSize:50}}
            onChange={this.handleChange}
         />
		 <input
            type="text"
			id="letter4"
			maxLength="1"
            value={this.state.letter4}
            onChange={this.handleChange}
			style={{width:50,margin:3,fontSize:50}}
         />
		<br/>
		<br/> 
		 <button id='clear' onClick={this.clearWord} style={{margin:5}} disabled={this.state.showSuccess}>Clear</button>
		 <button id='submit' onClick={this.submitWord} style={{backgroundColor:"#00B1E1"}} disabled={this.state.showSuccess}>Check Word</button>
		 <br/>
		 <br/>
		  
		 <Table striped bordered hover size="sm">
		 <tbody>
     {this.state.pastGuess.map((item) =>
		 {return(
		<tr>
		<td>{item.word}</td>
		<td>{item.bulls} Bulls</td>
		<td>{item.cows} Cows</td>
		</tr>
	 )})}
	  </tbody>
    </Table>
	 <Modal show={this.state.showModal} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Word Does not exist</Modal.Title>
        </Modal.Header>
        <Modal.Body>Enter a Valid Word !
		</Modal.Body>
		</Modal>
		</Col>
		</Row>
	</Container>
	);
  }
 
}

export default withAuthenticator(Game);