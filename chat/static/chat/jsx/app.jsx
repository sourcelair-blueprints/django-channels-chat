(function(React, ReactDOM, window, document, MDL) {
	'use strict';

	var AddNewChat = function AddNewChat(props) {
		return(
			<div>
				<button 
					id='add-chat-button'
					className='mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored'
					onClick={props.addChat}>
					<i className='material-icons'>add</i>
				</button>
				<span className='mdl-tooltip mdl-tooltip--left' htmlFor='add-chat-button'>
					Add new chat
				</span>
			</div>
		);
	};

	var Header = function Header(props) {
		return (
			<header className='mdl-layout__header  mdl-color--primary'>
				<div className='mdl-layout-icon'></div>
				<div className='mdl-layout__header-row'>
					<h1 className='mdl-layout__title'>Django Channels Chat</h1>
				</div>
				<div className='mdl-layout-spacer'></div>
			</header>
		);
	};

	var LoadingBar = function LoadingBar(props) {
		return (
			<div className='mdl-progress mdl-js-progress mdl-progress__indeterminate'></div>
		);
	}

	var Message = function Message(props) {
		var classString = (props.ownMessage) ? 'own ' : '';
		return (
			<div className={classString + 'message clearfix'}>
				<div className='message__author'>{(props.ownMessage) ? 'You' : props.author}</div>
				<div className='message__avatar'></div>
				<div className='message__text'>{props.text}</div>
			</div>
		);
	};

	var MessageList = React.createClass({

		componentDidUpdate : function() {
			this.messageList.scrollTop = this.messageList.scrollHeight;
		},

		getNodeRef : function(ref) {
			this.messageList = ref
		},

		render : function() {
			return (
				<div className='message-list' ref={this.getNodeRef}>
					{this.props.children}
				</div>
			)
		}
	});

	var InputSection = function InputSection(props) {
		return (
			<div className={props.specificClass + ' clearfix'}>
				<div className='mdl-textfield mdl-js-textfield mdl-textfield--floating-label float-left'>
					<input 
						onKeyDown={props.handleKeyDown}
						className='mdl-textfield__input' 
						type='text' 
						value={props.inputValue}
						onChange={props.handleChange}
						onBlur={props.handleBlur}/>
					<label className='mdl-textfield__label'>
						{props.labelText}
					</label>
				</div>
				<div className='float-right button-container'>
					<button 
						onClick={props.handleClick}
						className='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent'
						type='submit'>
						{props.buttonText}
					</button>
				</div>
			</div>
		);
	};

	var ChannelSelector = React.createClass({

		getInitialState : function() {
			return { 
				channel : this.props.currentChannel 
			};
		},

		handleChange : function(e) {
			this.setState({
				channel : e.target.value
			});
		},

		changeChannel : function() {
			if (this.state.channel === '') {
				return;
			}
			this.props.handleChatChange(this.state.channel);
		},

		resetInput : function() {
			this.setState({
				channel : this.props.currentChannel
			});
		},

		handleKeyDown : function(e) {
			switch (e.keyCode) {
				case 13 :
					e.preventDefault();
					this.changeChannel();
					e.target.blur();
					break;
				case 27 :
					e.preventDefault();
					this.resetInput();
					e.target.blur();
					break;
				case 32 :
					e.preventDefault();
					break;
				default :
					return;
			}
		},

		render : function() {
			return (
				<InputSection 
					specificClass='chat-name'
					handleKeyDown={this.handleKeyDown}
					inputValue={this.state.channel}
					handleChange={this.handleChange}
					labelText='Currently connected to channel'
					handleClick={this.changeChannel}
					buttonText='Connect'
					/>
			);
		}
	});


	var MessageEditor = React.createClass({

		getInitialState : function() {
			return { 
				message : '' 
			};
		},

		handleChange : function(e) {
			this.setState({
				message : e.target.value
			});
		},

		sendMessage : function(e) {
			this.props.sendMessage(this.state.message);
			this.setState({
				message : ''
			});
		},

		handleKeyDown : function(e) {
			switch (e.keyCode) {
				case 13 :
					e.preventDefault();
					if (this.state.message === '') {
						return;
					}
					this.sendMessage();
					break;
				default :
					return;
			}
		},

		render : function() {
			return (
				<InputSection 
					specificClass='form-container'
					handleKeyDown={this.handleKeyDown}
					inputValue={this.state.message}
					handleChange={this.handleChange}
					labelText='Enter your message...'
					handleClick={this.sendMessage}
					buttonText='Send message'
					/>
			);
		}

	}); 

	var ChatContainer = React.createClass({

		getInitialState : function() {
			return {
				channel : 'General',
				connected : false,
				messages : [],
				author : ''
			};
		},

		socket : null,

		createSocket : function createSocket() {
			var url = 'wss://' + location.hostname + '/chat/' + this.state.channel + 
				'?username=' + this.state.author

			this.socket = new WebSocket(url);

			window.chatSocket = this.socket;

			this.socket.addEventListener('message', function(e) {
				this.setState({ 
					messages : this.state.messages.concat(JSON.parse(e.data)) 
				});
			}.bind(this));

			this.socket.addEventListener('open', function() {
				this.setState({
					connected : true
				})
			}.bind(this));

			this.socket.addEventListener('close', function() {
				this.setState({
					connected : false
				}, this.createSocket);
			}.bind(this));
		},

		closeSocket : function() {
			this.socket.close();
		},

		componentWillMount : function() {
			var author = window.prompt('Please enter a nickname') || 'John Doe';
			this.setState({
				author : author
			});
		},

		componentDidMount : function() {
			this.createSocket();

			this.chatBox.querySelector('.message-list').style.bottom = 
				this.chatBox.querySelector('.actions-container').offsetHeight + 'px';

			window.addEventListener('resize', function() {
				this.chatBox.querySelector('.message-list').style.bottom = 
					this.chatBox.querySelector('.actions-container').offsetHeight + 'px';
			}.bind(this));

			MDL.upgradeDom();
		},

		componentDidUpdate : function() {
			this.chatBox.querySelector('.message-list').style.bottom = 
				this.chatBox.querySelector('.actions-container').offsetHeight + 'px';

			MDL.upgradeDom();
		},

		sendMessage : function handleMessageSend(message) {
			this.socket.send(message);
		},

		handleChatChange : function handleChatChange(newChannelName) {
			if (newChannelName === this.state.channel) {
				return;
			}
			this.setState({ 
				messages : [],
				channel : newChannelName
			}, this.closeSocket);
		},

		getNodeRef : function(ref) {
			this.chatBox = ref;
		},

		render : function() {
			var messages = this.state.messages.map(function(message, index) {
				return (
					<Message 
						ownMessage={(message.username === this.state.author) ? true : false}
						text={message.message}
						author={message.username}
						key={index} />
				);
			}.bind(this));

			var visibilityClass = (!this.state.connected) ? 'hidden' : '';

			return (
				<div className='mdl-shadow--2dp chat-box mdl-cell mdl-cell--4-col mdl-cell--stretch' ref={this.getNodeRef}>
					{(!this.state.connected) ? <LoadingBar /> : null} 
					<MessageList>
						{messages}
					</MessageList>
					<div className={'actions-container mdl-shadow--3dp ' + visibilityClass}>
						<ChannelSelector 
							currentChannel={this.state.channel} 
							handleChatChange={this.handleChatChange} />
						<MessageEditor sendMessage={this.sendMessage}/>
					</div> 
				</div>
			);
		}

	});

	var App = React.createClass({

		getInitialState : function() {
			return { 
				chats : 1
			};
		},

		addChat : function() {
			this.setState({ 
				chats : ++this.state.chats
			});
		},

		render : function() {
			var chats = [];
			for (var i = 0; i < this.state.chats; i++) {
				chats.push(<ChatContainer key={i} />)
			}
			return (
				<div className='mdl-layout mdl-js-layout mdl-layout--fixed-header' >
					<Header />
					<main className='mdl-layout__content'>
						<div className='mdl-grid'>
							{chats}
						</div>
					</main>
					{(chats.length < 3) ? <AddNewChat addChat={this.addChat}/> : null}
				</div>
			);
		}

	});

	ReactDOM.render(
		<App />,
		document.getElementById('app')
	);

})(React, ReactDOM, window, document, componentHandler);