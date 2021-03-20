# Privacy Policy

The latexcgi service currently running at
[texlive.net](https://texlive.net) is  an open source service with
code available at [GitHub](https://davidcarlisle.github.io/latexcgi/).

The server accepts HTTP POST submissions and returns results
(typically PDF but also potential plain text log files or HTML).


No information supplied is stored long term:

* Any documents submitted are saved to a temporary directory which is
  deleted as soon as the request is processed (typically a few
  seconds after submission).
  
* Resulting PDF documents or log files are returned to the user with a
  public but obfuscated URL.
  
  This document will be served for between 1 and 2 hours.
  A scheduled job runs every hour deleting any documents that are more
  than an hour old.
  
* In common with most web servers basic logging information is
  recorded by the server, which include the IP address of the machine
  making the document request and other information. The default
  apache web server logging is used here which just preserves this
  information for two weeks, for debugging information. These log
  files may be used for basic reporting of, for example, basic usage
  counts on the server, but no personal information is extracted.
  
* The site only processes POST requests to the latexcgi script and does
  not use cookies or any other individual data. Note however that
  sites making use of this service may have user login or other
  personal data stored in cookies. Any such data is not controlled (or
  passed to) this site.
  
  
David Carlisle

