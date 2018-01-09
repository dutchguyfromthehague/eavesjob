const React = require('react');
const PropTypes = require('prop-types');

const { Link } = require('react-router-dom');
const { Available } = require('../Retrieve');

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    }
  }
  componentDidMount() {
    let canUseDOM = !!(
          typeof window !== 'undefined' &&
          window.document &&
          window.document.createElement
    );
    if (canUseDOM) {
      let user = localStorage.getItem('user');
      if (user) {
        this.setState({
          user: JSON.parse(user)
        })
      }
    }
  }
  render() {
    return (
      <div id="browse-page">
        <div id="browse-left">
          <div id="search-website">
            <h2>selected career pages</h2>
            <div className="search-div">  </div>
          </div>
          <Available available = {this.state.user}/>
          <div id="profile-premium">
            <h2>go premium</h2>
          </div>
        </div>
        <div className="right-sidebar">
          <div id="welcome-user">
            <div className="right-sidebar-title">
              <p>Hi {this.state.user.firstName}!</p>
              <button className="big-button" onClick = {this.props.handleLogout}> Log out </button>
            </div>
          </div>
          <div className="request-website">
            <div className="right-sidebar-title">
              <h2>find more career pages </h2>
            </div>
            <div className="single-text">
              <p> </p>
            </div>
            <div className="single-text">
              <button className="big-button"><Link to='/browse'>browse career pages</Link></button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = {
  Profile: Profile
}
