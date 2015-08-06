var robotsReq = new XMLHttpRequest(),
  fqdn = window.location.protocol + '//' + window.location.host,
  robotsURL = '/robots.txt',
  paths;


var START_GROUP = 'START_GROUP',
  GROUP_MEMBER = 'GROUP_MEMBER',
  NON_GROUP = 'NON_GROUP';

// fire a request to the backend to see if we already have this site
chrome.runtime.sendMessage({
  type: 'site-check',
  domain: fqdn
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'site-check-response' && !request.hasSite) {
      // this is a new site
      robotsReq.open('GET', fqdn + robotsURL, true);
      robotsReq.onload = function (e) {
        if (robotsReq.readyState === 4) {
          if (robotsReq.status === 200) {
            paths = parseRobots(robotsReq.responseText);

            chrome.runtime.sendMessage({
              type: 'site-data-add',
              paths: paths,
              domain: fqdn
            }, function (response) {
              // once the site is loaded, set the badge
              chrome.runtime.sendMessage({
                type: 'set-badge',
                domain: fqdn
              });
            });
          }
        }
      };

      robotsReq.send();

    } else {
      // already have the site; set the badge
      chrome.runtime.sendMessage({
        type: 'set-badge',
        domain: fqdn
      });
    }
  });

function parseRobots(rawBots) {
  var lines = rawBots.split("\n"),
    parsedLine,
    robotPaths = [];

  lines.forEach(function(line) {
    parsedLine = parseLine(line);
    if (!parsedLine) {
      //ignore null results
    } else if (parsedLine.type == GROUP_MEMBER) {
      if (parsedLine.rule = 'disallow') {
        //only grab disallowed URLs
        robotPaths.push(parsedLine.path);
      }
    }
  });

  /**
   * deduplication courtesy of http://stackoverflow.com/a/15868720
   * also gets rid of duplicate paths with both leading slash and non-
   * leading slash noted
   */
  robotPaths = robotPaths.reduce(function(a, b) {
    if (a.indexOf(b) < 0 && a.indexOf('/' + b) < 0) {
      // insert a leading slash if we don't have one
      b.charAt(0) == '/' ? a.push(b) : a.push('/' + b);
    }
    return a;
  }, []);

  return robotPaths;
}

function parseLine(line) {
  // github.com/Woorank/robots-txt-parse
  var commentFree = line.replace(/#.*$/, ''),
    index = commentFree.indexOf(':');

  if (index === -1) {
    return null;
  }

  var field = commentFree.substr(0, index).trim().toLowerCase(),
    value = commentFree.substr(index + 1).trim();

  switch (field) {
    case 'user-agent':
      return {
        type: START_GROUP,
        agent: value
      };
    case 'allow':
    case 'disallow':
      return {
        type: GROUP_MEMBER,
        rule: field,
        path: value
      };
    default:
      return {
        type: NON_GROUP,
        field: field,
        value: value
      };
  }
}
