import React, { Timeout } from "react";
import { createResource } from "simple-cache-provider";
import { withCache } from "./components/withCache";
import logo from "./logo.svg";
import "./App.css";

const sleep = ms => new Promise(r => setTimeout(() => r(), ms));

const readArticles = createResource(async function fetchNews(props) {
  await sleep(3000);
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search_by_date?query=${props}`
  );
  return await res.json();
});

const readArticleInfo = createResource(async function fetchNews(props) {
  await sleep(3000);
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/13629344.json`
  );
  return await res.json();
});

const Articles = withCache(props => {
  const result = readArticles(props.cache, props.query, props.onClick);

  return (
    <div className="results">
      {result &&
        result.hits.length &&
        result.hits.map(item => (
          <ul key={item.objectID}>
            <li>{item.created_at}</li>
            <li>
              <button value={item.objectID} onClick={props.onClick}>
                {item.story_title}
              </button>
            </li>
          </ul>
        ))}
    </div>
  );
});

const ArticleInfo = withCache(props => {
  // console.log(props);
  const result = readArticleInfo(props.cache, props.query, props.onClick);
  return (
    <div className="article">
      {result && (
        <ul key={result.id}>
          <li>
            Story by
            {result.by}
          </li>
          <li>
            <a href={result.url} target="blank">
              {result.title}
            </a>
          </li>
          <li>
            <button onClick={props.onClick}>Back</button>
          </li>
        </ul>
      )}
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
      submited: false,
      searchForStory: "",
      storyTabOpen: false
    };
  }
  handleChange = event => {
    this.setState({ value: event.target.value, submited: false });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submited: true });
  };

  handleClick = event => {
    this.setState({
      searchForStory: event.target.value,
      storyTabOpen: true
    });
  };

  handleGoBack = () => {
    this.setState({
      storyTabOpen: false
    });
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
              this.state.value &&
              !this.state.storyTabOpen && (
                <Placeholder
                  delayMs={1000}
                  fallback={
                    <div className="placeholder">
                      <img className="App-logo" src={logo} alt="waiting logo" />
                      Loading articles...
                    </div>
                  }
                >
                  <Articles
                    query={this.state.value}
                    onClick={this.handleClick}
                  />
                </Placeholder>
              )}
            {this.state.storyTabOpen && (
              <Placeholder
                delayMs={1000}
                fallback={
                  <div className="placeholder">
                    <img className="App-logo" src={logo} alt="waiting logo" />
                    Loading articles info ...
                  </div>
                }
              >
                <ArticleInfo
                  query={this.state.searchForStory}
                  onClick={this.handleGoBack}
                />
              </Placeholder>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
