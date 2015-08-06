function init_list() {
  var url_components,
    current_domain;

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request.type);
    });

  // set our domain
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    url_components = tabs[0].url.split('/');
    current_domain = url_components[0] + '//' + url_components[2];
  });

  // listen for link clicks
  window.addEventListener('click', function(e) {
    if (e.target.href !== undefined) {
      chrome.tabs.create({
        url: e.target.href
      })
    } else {
      // query the endpoint
      chrome.runtime.sendMessage({
        type: 'query-endpoint',
        domain: current_domain,
        id: e.target.id
      });
    }
  })

  // fill er up
  chrome.runtime.sendMessage({
    type: 'get-data',
    domain: current_domain
  }, function(response) {
    populateTable(response, current_domain);
  });

  setInterval(chrome.runtime.sendMessage, 500, {
    type: 'get-data',
    domain: current_domain
  }, function(response) {
    populateTable(response, current_domain);
  });
};

function populateTable(domain_endpoints, current_domain) {
  if (domain_endpoints.count > 0) {
    // clear the table for a redraw
    var table = document.getElementById('data');
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    table.innerHTML = "<tr><th>URL</th><th>Status</th></tr>";

    document.getElementById('status').innerHTML = current_domain + ': Loading...';

    // reverse so we can add to the bottom of the table and come out with the right order
    domain_endpoints.data.reverse();

    for (var i = 0; i < domain_endpoints.data.length; i++) {

      var row = table.insertRow(-1);
      var url_cell = row.insertCell(0);
      var status_cell = row.insertCell(1);

      url_cell.innerHTML = '<a href="' + current_domain + domain_endpoints.data[i].url + '">' + domain_endpoints.data[i].url + '</a>';

      if (String(domain_endpoints.data[i].code).charAt(0) === 'u') {
        status_cell.innerHTML = '<button class="btn btn-primary btn-sm" id="' + domain_endpoints.data[i].id + '" type="button">Query</button>';
      } else if (String(domain_endpoints.data[i].code).charAt(0) === '4') {
        status_cell.innerHTML = '<span class="label label-danger">' + domain_endpoints.data[i].code + '</span>';
      } else if (String(domain_endpoints.data[i].code).charAt(0) === '2') {
        status_cell.innerHTML = '<span class="label label-success">' + domain_endpoints.data[i].code + '</span>';
      } else {
        status_cell.innerHTML = '<span class="label label-warning">' + domain_endpoints.data[i].code + '</span>';
      }

    }
    document.getElementById('status').innerHTML = current_domain + '<br /><button class="btn btn-success btn-sm" id="-1" type="button">Query All</button>';
    table.style.display = 'inline';
  } else {
    document.getElementById('status').innerHTML = 'No robots exclusions.';
  }
}

// bind events to dom elements
document.addEventListener('DOMContentLoaded', init_list);
