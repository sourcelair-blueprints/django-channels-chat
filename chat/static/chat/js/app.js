'use strict';

(function (React, ReactDOM, window, document, MDL) {
	'use strict';

	var AddNewChat = function AddNewChat(props) {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'button',
				{
					id: 'add-chat-button',
					className: 'mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored',
					onClick: props.addChat },
				React.createElement(
					'i',
					{ className: 'material-icons' },
					'add'
				)
			),
			React.createElement(
				'span',
				{ className: 'mdl-tooltip mdl-tooltip--left', htmlFor: 'add-chat-button' },
				'Add new chat'
			)
		);
	};

	var Header = function Header(props) {
		return React.createElement(
			'header',
			{ className: 'mdl-layout__header  mdl-color--primary' },
			React.createElement('div', { className: 'mdl-layout-icon' }),
			React.createElement(
				'div',
				{ className: 'mdl-layout__header-row' },
				React.createElement(
					'h1',
					{ className: 'mdl-layout__title' },
					'Django Channels Chat'
				)
			),
			React.createElement('div', { className: 'mdl-layout-spacer' })
		);
	};

	var LoadingBar = function LoadingBar(props) {
		return React.createElement('div', { className: 'mdl-progress mdl-js-progress mdl-progress__indeterminate' });
	};

	var Message = function Message(props) {
		var classString = props.ownMessage ? 'own ' : '';
		return React.createElement(
			'div',
			{ className: classString + 'message clearfix' },
			React.createElement(
				'div',
				{ className: 'message__author' },
				props.ownMessage ? 'You' : props.author
			),
			React.createElement('div', { className: 'message__avatar' }),
			React.createElement(
				'div',
				{ className: 'message__text' },
				props.text
			)
		);
	};

	var MessageList = React.createClass({
		displayName: 'MessageList',


		componentDidUpdate: function componentDidUpdate() {
			this.messageList.scrollTop = this.messageList.scrollHeight;
		},

		getNodeRef: function getNodeRef(ref) {
			this.messageList = ref;
		},

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'message-list', ref: this.getNodeRef },
				this.props.children
			);
		}
	});

	var InputSection = function InputSection(props) {
		return React.createElement(
			'div',
			{ className: props.specificClass + ' clearfix' },
			React.createElement(
				'div',
				{ className: 'mdl-textfield mdl-js-textfield mdl-textfield--floating-label float-left' },
				React.createElement('input', {
					onKeyDown: props.handleKeyDown,
					className: 'mdl-textfield__input',
					type: 'text',
					value: props.inputValue,
					onChange: props.handleChange,
					onBlur: props.handleBlur }),
				React.createElement(
					'label',
					{ className: 'mdl-textfield__label' },
					props.labelText
				)
			),
			React.createElement(
				'div',
				{ className: 'float-right button-container' },
				React.createElement(
					'button',
					{
						onClick: props.handleClick,
						className: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent',
						type: 'submit' },
					props.buttonText
				)
			)
		);
	};

	var ChannelSelector = React.createClass({
		displayName: 'ChannelSelector',


		getInitialState: function getInitialState() {
			return {
				channel: this.props.currentChannel
			};
		},

		handleChange: function handleChange(e) {
			this.setState({
				channel: e.target.value
			});
		},

		changeChannel: function changeChannel() {
			if (this.state.channel === '') {
				return;
			}
			this.props.handleChatChange(this.state.channel);
		},

		resetInput: function resetInput() {
			this.setState({
				channel: this.props.currentChannel
			});
		},

		handleKeyDown: function handleKeyDown(e) {
			switch (e.keyCode) {
				case 13:
					e.preventDefault();
					this.changeChannel();
					e.target.blur();
					break;
				case 27:
					e.preventDefault();
					this.resetInput();
					e.target.blur();
					break;
				case 32:
					e.preventDefault();
					break;
				default:
					return;
			}
		},

		render: function render() {
			return React.createElement(InputSection, {
				specificClass: 'chat-name',
				handleKeyDown: this.handleKeyDown,
				inputValue: this.state.channel,
				handleChange: this.handleChange,
				labelText: 'Currently connected to channel',
				handleClick: this.changeChannel,
				buttonText: 'Connect'
			});
		}
	});

	var MessageEditor = React.createClass({
		displayName: 'MessageEditor',


		getInitialState: function getInitialState() {
			return {
				message: ''
			};
		},

		handleChange: function handleChange(e) {
			this.setState({
				message: e.target.value
			});
		},

		sendMessage: function sendMessage(e) {
			this.props.sendMessage(this.state.message);
			this.setState({
				message: ''
			});
		},

		handleKeyDown: function handleKeyDown(e) {
			switch (e.keyCode) {
				case 13:
					e.preventDefault();
					if (this.state.message === '') {
						return;
					}
					this.sendMessage();
					break;
				default:
					return;
			}
		},

		render: function render() {
			return React.createElement(InputSection, {
				specificClass: 'form-container',
				handleKeyDown: this.handleKeyDown,
				inputValue: this.state.message,
				handleChange: this.handleChange,
				labelText: 'Enter your message...',
				handleClick: this.sendMessage,
				buttonText: 'Send message'
			});
		}

	});

	var ChatContainer = React.createClass({
		displayName: 'ChatContainer',


		getInitialState: function getInitialState() {
			return {
				channel: 'General',
				connected: false,
				messages: [],
				author: ''
			};
		},

		socket: null,

		createSocket: function createSocket() {
			var url = 'wss://' + location.hostname + '/chat/' + this.state.channel + '?username=' + this.state.author;

			this.socket = new WebSocket(url);

			window.chatSocket = this.socket;

			this.socket.addEventListener('message', function (e) {
				this.setState({
					messages: this.state.messages.concat(JSON.parse(e.data))
				});
			}.bind(this));

			this.socket.addEventListener('open', function () {
				this.setState({
					connected: true
				});
			}.bind(this));

			this.socket.addEventListener('close', function () {
				this.setState({
					connected: false
				}, this.createSocket);
			}.bind(this));
		},

		closeSocket: function closeSocket() {
			this.socket.close();
		},

		componentWillMount: function componentWillMount() {
			var author = window.prompt('Please enter a nickname') || 'John Doe';
			this.setState({
				author: author
			});
		},

		componentDidMount: function componentDidMount() {
			this.createSocket();

			this.chatBox.querySelector('.message-list').style.bottom = this.chatBox.querySelector('.actions-container').offsetHeight + 'px';

			window.addEventListener('resize', function () {
				this.chatBox.querySelector('.message-list').style.bottom = this.chatBox.querySelector('.actions-container').offsetHeight + 'px';
			}.bind(this));

			MDL.upgradeDom();
		},

		componentDidUpdate: function componentDidUpdate() {
			this.chatBox.querySelector('.message-list').style.bottom = this.chatBox.querySelector('.actions-container').offsetHeight + 'px';

			MDL.upgradeDom();
		},

		sendMessage: function handleMessageSend(message) {
			this.socket.send(message);
		},

		handleChatChange: function handleChatChange(newChannelName) {
			if (newChannelName === this.state.channel) {
				return;
			}
			this.setState({
				messages: [],
				channel: newChannelName
			}, this.closeSocket);
		},

		getNodeRef: function getNodeRef(ref) {
			this.chatBox = ref;
		},

		render: function render() {
			var messages = this.state.messages.map(function (message, index) {
				return React.createElement(Message, {
					ownMessage: message.username === this.state.author ? true : false,
					text: message.message,
					author: message.username,
					key: index });
			}.bind(this));

			var visibilityClass = !this.state.connected ? 'hidden' : '';

			return React.createElement(
				'div',
				{ className: 'mdl-shadow--2dp chat-box mdl-cell mdl-cell--4-col mdl-cell--stretch', ref: this.getNodeRef },
				!this.state.connected ? React.createElement(LoadingBar, null) : null,
				React.createElement(
					MessageList,
					null,
					messages
				),
				React.createElement(
					'div',
					{ className: 'actions-container mdl-shadow--3dp ' + visibilityClass },
					React.createElement(ChannelSelector, {
						currentChannel: this.state.channel,
						handleChatChange: this.handleChatChange }),
					React.createElement(MessageEditor, { sendMessage: this.sendMessage })
				)
			);
		}

	});

	var App = React.createClass({
		displayName: 'App',


		getInitialState: function getInitialState() {
			return {
				chats: 1
			};
		},

		addChat: function addChat() {
			this.setState({
				chats: ++this.state.chats
			});
		},

		render: function render() {
			var chats = [];
			for (var i = 0; i < this.state.chats; i++) {
				chats.push(React.createElement(ChatContainer, { key: i }));
			}
			return React.createElement(
				'div',
				{ className: 'mdl-layout mdl-js-layout mdl-layout--fixed-header' },
				React.createElement(Header, null),
				React.createElement(
					'main',
					{ className: 'mdl-layout__content' },
					React.createElement(
						'div',
						{ className: 'mdl-grid' },
						chats
					)
				),
				chats.length < 3 ? React.createElement(AddNewChat, { addChat: this.addChat }) : null
			);
		}

	});

	ReactDOM.render(React.createElement(App, null), document.getElementById('app'));
})(React, ReactDOM, window, document, componentHandler);