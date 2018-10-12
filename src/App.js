import React, { Timeout } from "react";
import { createResource } from "simple-cache-provider";
import { withCache } from "./components/withCache";
import logo from "./logo.svg";
import "./App.css";

const sleep = ms => new Promise(r => setTimeout(() => r(), ms));

const readShows = createResource(async function fetchNews(props) {
  await sleep(3000);
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search_by_date?query=${props}`
  );
  // console.log(res);
  return await res.json();
});

const Movies = withCache(props => {
  // console.log(props);
  const result = readShows(props.cache, props.query);

  return (
    <div className="results">
      {result &&
        result.hits.length &&
        result.hits.map(item => (
          <ul key={item.objectID}>
            <li>{item.created_at}</li>
            <li>
              <a href={item.story_url} target="blank">
                {item.story_title}
              </a>
            </li>
          </ul>
        ))}
    </div>
  );
});

const Placeholder = ({ delayMs, fallback, children }) => {
  return (
    <Timeout ms={delayMs}>
      {didExpire => {
        return didExpire ? fallback : children;
      }}
    </Timeout>
  );
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      submited: false
    };

    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleChange = this.handleChange.bind(this);
  }
  handleChange = event => {
    this.setState({ value: event.target.value, submited: false });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submited: true });
  };
  render() {
    return (
      <React.Fragment>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">React Suspense Demo</h1>
          </header>

          <div className="container">
            <form className="form" onSubmit={this.handleSubmit}>
              <label>
                Articles related to:
                <input
                  type="text"
                  name="name"
                  value={this.state.value}
                  onChange={this.handleChange}
                />
              </label>
              <input type="submit" value="Submit" />
            </form>
            {this.state.submited &&
              this.state.value && (
                <Placeholder
                  delayMs={1000}
                  fallback={
                    <div className="placeholder">
                      <img className="App-logo" src={logo} alt="waiting logo" />
                      Loading articles...
                    </div>
                  }
                >
                  <Movies query={this.state.value} />
                </Placeholder>
              )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
