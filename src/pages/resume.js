import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Layout from 'gatsby-theme-blog/src/components/layout';
import resume from '../../content/resume';

const Title = ({ children, style = {}, ...props }) => {
  return (
    <h1 style={{ textDecoration: 'underline', ...style }} {...props}>
      {children}
    </h1>
  );
};

export default props => {
  const data = useStaticQuery(resumeQuery);
  const {
    site: {
      siteMetadata: { title },
    },
  } = data;
  return (
    <Layout {...props} title={title}>
      <p>
        Most of my experience is in React, but I've also worked a lot with Ruby
        on Rails, Java, and Python.
      </p>
      <p>
        Unless there's a very good reason not to, almost all of my side projects
        are done in Clojure(script).
      </p>
      <Title style={{ textDecoration: 'underline' }}>Work Experience</Title>
      {resume.map(job => (
        <React.Fragment>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              justifyItems: 'center',
            }}
          >
            <h2>{job.company}</h2>
            <div style={{ textDecoration: 'underline' }}>
              {job.start} - {job.end}
            </div>
          </div>
          <ul>
            {job.responsibilities.map(r => (
              <li>{r}</li>
            ))}
          </ul>

          {/* <ResumeCompanyDescription>
            ForeFlight is used by individual pilots and professional flight
            crews to gather weather and destination information efficiently. It
            is has become the go-to app to route, plan and file, access and
            manage electronic charts and maps, organize flight publications, and
            used as a reference for enroute navigation aid.
          </ResumeCompanyDescription> */}
        </React.Fragment>
      ))}
      <Title>Education</Title>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>University of Texas at Austin</strong>
          <span>B.S. Computer Science</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>December 2015</span>
          <span>GPA: 3.35</span>
        </div>
      </div>
    </Layout>
  );
};

const resumeQuery = graphql`
  query resumeQuery {
    site {
      siteMetadata {
        title
        author
      }
    }
  }
`;
