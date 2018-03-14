import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
var jsonMarkup = require('json-markup')

const { Link } = require('react-router-dom');
import {
    Redirect,
    Route,
    Switch,
    withRouter
} from 'react-router-dom';

class AdminForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      objectID: "",
      objectName: "",
      objectType: "Website",
      error: "",
      returnObj: {}
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  retrieveObject = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/adminDB/${this.props.user.token}`, {
      objectID: this.state.objectID,
      objectName: this.state.objectName,
      objectType: this.state.objectType
    })
    .then((response) => {
      console.log(response);
      this.setState({
        returnObj: response.data
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      });
    });
  }
  render() {
    return (
      <form className="form-small" onSubmit={this.retrieveObject}>
        <div className="form-group">
          <input id="name" type="text" placeholder="object ID" name="objectID" className="big-input" onChange = {this.handleChange} value = {this.state.objectID}/>
        </div>
        <div className="form-group">
          <input id="name" type="text" placeholder="object Name" name="objectName" className="big-input" onChange = {this.handleChange} value = {this.state.objectName}/>
        </div>
        <div className="form-group">
          <select htmlFor="language" name="objectType" onChange = {this.handleChange} value = {this.state.objectType }>
            <option value="Website">Stored Website</option>
            <option value="RequestedWebsite">Requested Website</option>
            <option value="ReportedWebsite">Reported Website</option>
            <option value="Keyword">Keyword</option>
            <option value="User">User</option>
            <option value="RequestedModify">Requested Modify</option>
          </select>
        </div>
        {
            this.state.error !== "" ?
              <ErrorMessage eMessage = {this.state.error}/>
            :
              null
        }
        <div className="form-group">
          <button type="submit" className="big-button"> Find Object </button>
        </div>
        <div className="form-group">
          <div className="html-content" dangerouslySetInnerHTML={{__html: jsonMarkup(this.state.returnObj)}}></div>
        </div>
      </form>
    )
  }
}

AdminForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

function ErrorMessage(props) {
  return (
    <div className="form-group">
      <div className="warning">
        <p> {props.eMessage} </p>
      </div>
    </div>
  )
}

function SuccessMessage(props) {
  return (
    <div className="form-group">
      <div className="success">
        <p> {props.sMessage} </p>
      </div>
    </div>
  )
}

function ModifyLinks(props) {
  return (
    <p><Link to={props.link.href} target= "_blank"> {props.link.pathname} </Link></p>
  )
}

ModifyLinks.propTypes = {
  link: PropTypes.shape({
    href: PropTypes.string.isRequired,
    pathname: PropTypes.string.isRequired
  }).isRequired
}

class AddModifyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      requestID: "",
      websiteName: "",
      websiteLinks: [],
      websiteID: "",
      newLink: "",
      error: "",
      success: ""
    }
  }
  componentDidMount() {
    if (this.props.user.token) {
      this.retrieveRequestedModify(this.props.user);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user ) {
      this.retrieveRequestedModify(nextProps.user);
    }
  }
  retrieveRequestedModify = (user) => {
    axios.get(`http://localhost:3000/addModify/${user.token}`)
      .then((response) => {
        if (response.data.newLink) {
          let responseObj = {
            requestID: response.data.requestID,
            newLink: response.data.newLink,
            websiteID: response.data.websiteID,
            websiteName: response.data.websiteName,
            websiteLinks: response.data.websiteLinks
          };
          this.setState(responseObj);
        }
      })
      .catch((error) => {
        var eMessage = error.response.data.error.message;
        this.setState({
          error: eMessage
        })
      })
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performAddModify = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/addModify/${this.props.user.token}`, {
      requestID: this.state.requestID,
      websiteID: this.state.websiteID,
      newLink: this.state.newLink
    })
    .then((response) => {
      this.setState({
        "requestID": "",
        "newLink": "",
        "websiteID": "",
        "websiteName": "",
        "websiteLinks": [],
        "issue": "",
        "success": "success"
      }, function() {
        this.retrieveRequestedModify(this.props.user);
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      });
    });
  }
  performRemoveRequest = (e) => {
    axios.post(`http://localhost:3000/removeModify/${this.props.user.token}`, {
      requestID: this.state.requestID
    })
    .then((response) => {
      this.setState({
        "requestID": "",
        "newLink": "",
        "websiteID": "",
        "websiteName": "",
        "websiteLinks": [],
        "issue": "",
        "success": "success"
      }, function() {
        this.retrieveRequestedModify(this.props.user);
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      });
    });
  }
  render() {
    return(
      <div className="single">
        <div className="form-title">
          <h1>{`Add new link to website of ${this.state.websiteName}`}</h1>
        </div>
        <form className="form-small" onSubmit={this.performAddModify}>
          {
            this.state.websiteLinks.map(function(link) {
              return (
                <ModifyLinks link = {link} key= {link.origin} />
              )
            })
          }
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (1)" name="newLink" className="big-input" value={this.state.newLink} onChange={this.handleChange}/>
            <Link target = "_blank" to={this.state.newLink}>check link</Link>
          </div>
          <div className="form-group">
            <input type="text" name="websiteID" className="big-input" value={this.state.websiteID} disabled />
          </div>
          <div className="form-group">
            <input type="text" name="websiteID" className="big-input" value={this.state.requestID} disabled />
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          {
              this.state.success !== "" ?
                <SuccessMessage sMessage = "successfully sent"/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button">Add Modify</button>
          </div>
        </form>
        <div className="form-small">
          <button className="big-button" onClick={this.performRemoveRequest}> Remove Request </button>
        </div>
      </div>
    )
  }
}

AddModifyForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

class IssueForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      issueID: "",
      website: {},
      comments: "",
      error: "",
      success: ""
    }
  }
  componentDidMount() {
    if (this.props.user.token) {
      this.retrieveIssue(this.props.user);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user ) {
      this.retrieveIssue(nextProps.user);
    }
  }
  retrieveIssue = (user) => {
    axios.get(`http://localhost:3000/retrieveIssue/${user.token}`)
      .then((response) => {
        if (response.data.issueID) {
          let responseObj = {
            issueID: response.data.issueID,
            website: response.data.website,
            comments: response.data.comments
          };
          this.setState(responseObj);
        }
      })
      .catch((error) => {
        var eMessage = error.response.data.error.message;
        this.setState({
          error: eMessage
        });
      })
  }
  performRemoveIssue = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/removeIssue/${this.props.user.token}`, {
      issueID: this.state.issueID
    })
    .then((response) => {
      this.setState({
        "issueID": "",
        "website": {},
        "comments": "",
        "error": "",
        "success": "success"
      }, function() {
        this.retrieveIssue(this.props.user);
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      });
    });
  }
  render() {
    return (
      <form className="form-small" onSubmit={this.performRemoveIssue}>
        <div className="form-group">
          <p> {"There appears to be something up with " + this.state.website.name + "."}</p>
        </div>
        <div className="form-group">
        {
          this.state.website.links ?
            this.state.website.links.map(function(link) {
              return (
                <ModifyLinks link = {link} key= {link.origin} />
              )
            })
          : null
        }
        </div>
        <div className="form-group">
          <textarea type="text" className="big-textarea" placeholder="Comments" name="comments" value = {this.state.comments} />
        </div>
        {
            this.state.error !== "" ?
              <ErrorMessage eMessage = {this.state.error}/>
            :
              null
        }
        {
            this.state.success !== "" ?
              <SuccessMessage sMessage = "successfully sent"/>
            :
              null
        }
        <div className="form-group">
          <button type="submit" className="big-button"> Remove Issue </button>
        </div>
      </form>
    )
  }
}

IssueForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

class AddWebsiteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      links: ["", "", "", "", ""],
      numberShown: 0,
      requestedBy: [],
      websiteID: "",
      error: "",
      success: ""
    }
  }
  componentDidMount() {
    if (this.props.user.token) {
      this.retrieveRequestedWebsite(this.props.user);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user ) {
      this.retrieveRequestedWebsite(nextProps.user);
    }
  }
  expandInput = (e) => {
    const numberShown = this.state.numberShown + 1;
    if (numberShown === 4) {
      let expandButton = document.getElementsByClassName('expand')[0];
      expandButton.style.display = "none";
    }
    this.setState({
        numberShown: numberShown
    }, function() {
      let inputs = document.getElementsByClassName('request');
      inputs[this.state.numberShown].style.display = "flex";
    })
  }
  retrieveRequestedWebsite = (user) => {
    axios.get(`http://localhost:3000/addWebsite/${user.token}`)
      .then((response) => {
        if (response.data.name) {
          let links = response.data.links;
          const length = links.length;
          const inputs = document.getElementsByClassName('request');
          for (var i = 0; i < 5; i++) {
            if (!links[i]) {
              links[i] = "";
              inputs[i].style.display = "none";
            }
          }
          let responseObj = {
            name: response.data.name,
            requestedBy: response.data.requestedBy,
            websiteID: response.data._id,
            links: links,
            numberShown: length - 1
          };
          this.setState(responseObj);
        }
      })
      .catch((error) => {
        var eMessage = error.response.data.error.message;
        this.setState({
          error: eMessage
        })
      })
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  handleArrayChange = (e) => {
    const number = parseInt(e.target.name);
    let returnObj = {};
    returnObj.links = this.state.links;
    returnObj.links[number] = e.target.value;
    this.setState(returnObj);
  }
  performAddWebsite = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/addWebsite/${this.props.user.token}`, {
      name: this.state.name,
      requestedBy: this.state.requestedBy,
      websiteID: this.state.websiteID,
      links: this.state.links
    })
    .then((response) => {
      this.setState({
        name: "",
        links: ["", "", "", "", ""],
        requestedBy: [],
        websiteID: "",
        numberShown: 0,
        issue: "",
        success: "success"
      }, function() {
        this.retrieveRequestedWebsite(this.props.user);
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage,
        success: ""
      })
    });
  }
  performRemoveRequest = (e) => {
    axios.post(`http://localhost:3000/removeRequest/${this.props.user.token}`, {
      websiteID: this.state.websiteID
    })
    .then((response) => {
      this.setState({
        name: "",
        links: ["", "", "", "", ""],
        requestedBy: [],
        websiteID: "",
        numberShown: 0,
        issue: "",
        success: "success"
      }, function() {
        this.retrieveRequestedWebsite(this.props.user);
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage,
        success: ""
      })
    });
  }
  render() {
    return(
      <div className="single">
        <div className="form-title">
          <h1>Add New Website</h1>
        </div>
        <form className="form-small" onSubmit={this.performAddWebsite}>
          <div className="form-group">
            <input style={{marginBottom: "20px"}} type="text" placeholder="Website Name" className="big-input" name="name" value={this.state.name} onChange={this.handleChange} />
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (1)" name="0" className="big-input" value={this.state.links[0]} onChange={this.handleArrayChange}/>
            <Link target = "_blank" to={this.state.links[0]}>check link</Link>
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (2) (optional)" name="1" className="big-input" value={this.state.links[1]} onChange={this.handleArrayChange} />
            <Link target = "_blank" to={this.state.links[1]}>check link</Link>
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (3) (optional)" name="2" className="big-input" value={this.state.links[2]} onChange={this.handleArrayChange} />
            <Link target = "_blank" to={this.state.links[2]}>check link</Link>
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (4) (optional)" name="3" className="big-input" value={this.state.links[3]} onChange={this.handleArrayChange} />
            <Link target = "_blank" to={this.state.links[3]}>check link</Link>
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (5) (optional)" name="4" className="big-input" value={this.state.links[4]} onChange={this.handleArrayChange} />
            <Link target = "_blank" to={this.state.links[4]}>check link</Link>
          </div>
          <div className="form-group">
            <button type="button" className="big-button expand" onClick={this.expandInput}> Add Another Page </button>
          </div>

          <div className="form-group">
            <input type="text" name="requestedBy" className="big-input" value={this.state.requestedBy} disabled />
          </div>
          <div className="form-group">
            <input type="text" name="websiteID" className="big-input" value={this.state.websiteID} disabled />
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          {
              this.state.success !== "" ?
                <SuccessMessage sMessage = "successfully sent"/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button">Add Website</button>
          </div>
        </form>
        <div className="form-small">
          <button className="big-button" onClick={this.performRemoveRequest}> Remove Request </button>
        </div>
      </div>
    )
  }
}

AddWebsiteForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

class ReportWebsiteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: "",
      error: ""
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performReportWebsite = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/reportWebsite/${this.props.user.token}`, {
      websiteID: this.props.website._id,
      comments: this.state.comments
    })
    .then((response) => {
      // redirect to browse

      let data = response.data;
      this.setState({
        comments: ""
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      })
    });
  }
  render() {
    return (
        <form className="form-small" onSubmit={this.performReportWebsite}>
          <div className="form-group">
            <p> {"The links we currently have for " + this.props.website.name + " are:" }</p>
          </div>
          <div className="form-group">
          {
            this.props.website.links.map(function(link) {
              return (
                <ModifyLinks link = {link} key= {link.origin} />
              )
            })
          }
          </div>
          <div className="form-group">
            <p> Please indicate whether the name, one of the links, or anything else is incorrect or incomplete. </p>
          </div>
          <div className="form-group">
            <textarea type="text" className="big-textarea" placeholder="Comments" name="comments" value = {this.state.comments} onChange = {this.handleChange} />
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button"> Submit Issue </button>
          </div>
        </form>
    )
  }
}

ReportWebsiteForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  }),
  website: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
         href: PropTypes.string
    })).isRequired
  })
}

class ForgotPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      error: ""
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performForgotPassword = (e) => {
  }
  render() {
    return (
        <form className="form-small" onSubmit={this.performForgotPassword}>
          <div className="form-group">
            <input type="text" className="big-input" placeholder="Your Email Address" name="email" value = {this.state.email} onChange = {this.handleChange} />
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button"> Send Reset Email </button>
          </div>
        </form>
    )
  }
}

class ModifyWebsiteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      websiteID: this.props.website._id,
      newLink: "",
      error: ""
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performModifyWebsite = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/requestModify/${this.props.user.token}`, {
      websiteID: this.state.websiteID,
      newLink: this.state.newLink
    })
    .then((response) => {
      let data = response.data;
      this.setState({
        websiteID: "",
        newLink: ""
      });
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      })
    });
  }
  render() {
    return (
        <form className="form-small" onSubmit={this.performModifyWebsite}>
          <div className="form-group">
            <p> {"The links we currently have for " + this.props.website.name + " are:" }</p>
          </div>
          <div className="form-group">
          {
            this.props.website.links.map(function(link) {
              return (
                <ModifyLinks link = {link} key= {link.origin} />
              )
            })
          }
          </div>
          <div className="form-group">
            <input type="url" className="big-input" placeholder="Additional Career Page URL" name="newLink" value = {this.state.newLink} onChange = {this.handleChange} />
          </div>
          <div className="form-group">
            <p> It's easiest to copy the URL from your address bar. Please include the http:// or https:// part. </p>
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button"> Submit Additional Page </button>
          </div>
        </form>
    )
  }
}

ModifyWebsiteForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  }),
  website: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
         href: PropTypes.string
    })).isRequired
  })
}

class RequestWebsiteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      links: ["", "", "", "", ""],
      numberShown: 0,
      error: ""
    }
  }
  componentDidMount = (props) => {
    this.setState({
      name: this.props.query
    })
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.query !== this.props.query ) {
      this.setState({
        name: nextProps.query
      })
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  handleArrayChange = (e) => {
    const number = parseInt(e.target.name);
    let returnObj = {};
    returnObj.links = this.state.links;
    returnObj.links[number] = e.target.value;
    this.setState(returnObj);
  }
  expandInput = (e) => {
    const numberShown = this.state.numberShown + 1;
    if (numberShown === 4) {
      const expandButton = document.getElementsByClassName('expand')[0];
      expandButton.style.display = "none";
    }
    this.setState({
        numberShown: numberShown
    }, function() {
      const inputs = document.getElementsByClassName('request');
      inputs[this.state.numberShown].style.display = "flex";
    })
  }
  performRequestWebsite = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    if (this.state.name !== "") {
      axios.post(`http://localhost:3000/requestWebsite/${this.props.user.token}`, {
        name: this.state.name,
        links: this.state.links
      })
      .then((response) => {
        this.setState({
          name: "",
          links: ["", "", "", "", ""],
          numberShown: 0,
          error: ""
        }, function() {
          this.props.onRequest();
        });
      })
      .catch((error) => {
        var eMessage = error.response.data.error.message;
        this.setState({
          error: eMessage
        })
      });
    } else {
      this.setState({
        error: "All fields required."
      })
    }

  }
  render() {
    return(
      <div className="single" style={{width: '100%'}}>
        <form className="form-small" onSubmit={this.performRequestWebsite}>
          <div className="form-group">
            <p> It appears {this.props.query} is not in the database yet. Want to add it? </p>
          </div>
          <div className="form-group">
            <input type="text" placeholder="Website Name" className="big-input" name="name" value={this.state.name} onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <p> It's easiest to copy the URL from your address bar. Make sure to include the http:// or https:// part. </p>
          </div>
          <div className="form-group request">
            <input type="url" placeholder="Career Page URL (1)" name= "0" className="big-input" value={this.state.links[0]} onChange={this.handleArrayChange}/>
          </div>
          <div className="form-group request" style={{display: "none"}}>
            <input type="url" placeholder="Career Page URL (2) (optional)" name="1" className="big-input" value={this.state.links[1]} onChange={this.handleArrayChange} />
          </div>
          <div className="form-group request" style={{display: "none"}}>
            <input type="url" placeholder="Career Page URL (3) (optional)" name="2" className="big-input" value={this.state.links[2]} onChange={this.handleArrayChange} />
          </div>
          <div className="form-group request" style={{display: "none"}}>
            <input type="url" placeholder="Career Page URL (4) (optional)" name="3" className="big-input" value={this.state.links[3]} onChange={this.handleArrayChange} />
          </div>
          <div className="form-group request" style={{display: "none"}}>
            <input type="url" placeholder="Career Page URL (5) (optional)" name="4" className="big-input" value={this.state.links[4]} onChange={this.handleArrayChange} />
          </div>
          <div className="form-group">
            <button type="button" className="big-button expand" onClick={this.expandInput}> Add Another Career Page </button>
          </div>
          {
            this.state.error !== "" ?
              <ErrorMessage eMessage = {this.state.error}/>
            :
              null
          }
          <div className="form-group">
            <p> Once the the request comes through, we'll add the company to your subscribes automatically. Keep in mind this might take up to 24 hours. </p>
          </div>
          <div className="form-group">
            <button type="submit" className="big-button">Submit Website</button>
          </div>
        </form>
      </div>
    )
  }
}

RequestWebsiteForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  }),
  query: PropTypes.string.isRequired,
  onRequest: PropTypes.func.isRequired
}

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      redirect: false
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  saveSession = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  }
  performRegister = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post('http://localhost:3000/register', {
      email: this.state.email.toLowerCase(),
      password: this.state.password
    })
    .then((response) => {
      let user = response.data;
      this.saveSession(user);
      this.setState({
        redirect: true
      });
      this.props.onRegister(user);
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      })
    });
  }
  render() {
    return (
      this.state.redirect === false ?
        <form className="form-small" onSubmit={this.performRegister}>
          <div className="form-group">
            <input type="email" placeholder="Your Email Address" name="email" className="big-input" value={this.state.email} onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <input autoComplete="new-password" type="password" name="password" placeholder="Password" className="big-input" value={this.state.password} onChange={this.handleChange}/>
          </div>
          {
            this.state.error !== "" ?
              <ErrorMessage eMessage = {this.state.error}/>
            :
              null
          }
          <div className="form-group">
            <p><span> By signing up you agree to our </span><Link to='/conditions'>terms and conditions</Link><span>.</span></p>
          </div>
          <div className="form-group">
            <button type="submit" className="big-button">Sign up</button>
          </div>
        </form>
      : <Redirect to="/browse"/>
    )
  }
}

RegisterForm.propTypes = {
  onRegister: PropTypes.func.isRequired
}

class ContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      message: "",
      error: ""
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performContact = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    if (this.state.email !== "" && this.state.message !== "") {

    } else {
      this.setState({
        error: "All fields required."
      })
    }
  }
  render() {
    return (
        <form className="form-small" onSubmit={this.performContact}>
          <div className="form-group">
            <input type="email" id="email" placeholder="Your Email Address" name="email" className="big-input" value={this.state.email} onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <textarea type="text" id="password" placeholder="Your Message" name="message" className="big-textarea" value={this.state.message} onChange={this.handleChange} />
          </div>
          {
              this.state.error !== "" ?
                <ErrorMessage eMessage = {this.state.error}/>
              :
                null
          }
          <div className="form-group">
            <button type="submit" className="big-button"> Send Message </button>
          </div>
        </form>
    );
  }
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      redirect: false
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  saveSession = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  }
  performLogin = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post('http://localhost:3000/login', {
      email: this.state.email.toLowerCase(),
      password: this.state.password
    })
    .then((response) => {
      let user = response.data;
      this.saveSession(user);
      this.setState({
        redirect: true
      })
      this.props.onLogin(user);
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      })
    });
  }
  render() {
    return (
        this.state.redirect === false ?
          <form className="form-small" onSubmit={this.performLogin}>
              <div className="form-group">
                <input type="email" id="email" placeholder="Your Email Address" name="email" className="big-input" value={this.state.email} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <input type="password" id="password" placeholder="Your Password" name="password" className="big-input" value={this.state.password} onChange={this.handleChange} />
              </div>
              {
                  this.state.error !== "" ?
                    <ErrorMessage eMessage = {this.state.error}/>
                  :
                    null
              }
              <div className="form-group">
                <button type="submit" className="big-button">Log in</button>
              </div>
          </form> :
        <Redirect to="/browse"/>
    );
  }
}

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired
}

class KeywordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      category: "intern",
      language: "dutch",
      error: ""
    }
  }
  handleChange = (e) => {
    let returnObj = {};
    returnObj[e.target.name] = e.target.value;
    this.setState(returnObj);
  }
  performAddKeyword = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    axios.post(`http://localhost:3000/addKeyword/${this.props.user.token}`, {
      name: this.state.name,
      language: this.state.language,
      category: this.state.category
    })
    .then((response) => {
      this.setState({
        name: "",
        language: "dutch",
        category: "intern"
      })
    })
    .catch((error) => {
      var eMessage = error.response.data.error.message;
      this.setState({
        error: eMessage
      })
    });
  }
  render() {
    return (
      <form className="form-small" onSubmit={this.performAddKeyword}>
        <div className="form-group">
          <input id="name" type="text" placeholder="some keyword" name="name" className="big-input" onChange = {this.handleChange} value = {this.state.name}/>
        </div>
        <div className="form-group">
          <select htmlFor="language" name="language" onChange = {this.handleChange} value = {this.state.language }>
            <option value="dutch">Dutch</option>
            <option value="english">English</option>
          </select>
        </div>
        <div className="form-group">
          <select htmlFor="category" name="category" onChange = {this.handleChange} value = {this.state.category }>
            <option value="intern">intern</option>
            <option value="professional">professional</option>
            <option value="voluntary">voluntary</option>
            <option value="parttime">parttime</option>
            <option value="fulltime">fulltime </option>
            <option value="general">general</option>
          </select>
        </div>
        {
            this.state.error !== "" ?
              <ErrorMessage eMessage = {this.state.error}/>
            :
              null
        }
        <button style={{"marginTop": "15px" }} type="submit" className="big-button">Add keyword</button>
      </form>
    )
  }
}

KeywordForm.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  })
}

module.exports = {
  KeywordForm: KeywordForm,
  AddWebsiteForm: AddWebsiteForm,
  AddModifyForm: AddModifyForm,
  RequestWebsiteForm: RequestWebsiteForm,
  ModifyWebsiteForm: ModifyWebsiteForm,
  ReportWebsiteForm: ReportWebsiteForm,
  ForgotPasswordForm: ForgotPasswordForm,
  LoginForm: LoginForm,
  ContactForm: ContactForm,
  RegisterForm: RegisterForm,
  IssueForm: IssueForm,
  AdminForm: AdminForm
}
