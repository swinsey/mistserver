var theInterval = null;
var defaults = {
  conversion: {inputdir: './'},
  logRefreshing: [false,10000],
  update: {lastchecked: false}
};

function showTab(tabName,streamName) {
  
  ignoreHashChange = true;
  location.hash = location.hash.split('&')[0]+'&'+tabName+(streamName ? '@'+streamName : '');
  
  
  
  $('#menu .button').removeClass('current').filter(function(i){
    return $(this).text().toLowerCase() == tabName;
  }).addClass('current');
  
  $('#page').html('');
  clearInterval(theInterval);
  $('#menu').css('visibility', 'visible');
  
  switch(tabName) {
    case 'login':
      $('#menu').css('visibility', 'hidden');
      $('#page').html(
        $('<div>').addClass('description').html(
          'Please provide your account details.<br>You were asked to set these when MistController was started for the first time. If you did not yet set any account details, log in with your desired credentials to create a new account.'
        )
      ).append(
        $('<div>').addClass('input_container').html(
          $('<label>').attr('for','server').text('Host:').append(
            $('<input>').attr('id','server').attr('type','text').addClass('isSetting').addClass('validate-required').attr('placeholder','http://' + (location.host == '' ? 'localhost:4242' : location.host) + '/api')
          )
        ).append(
          $('<label>').attr('for','credentials-username').text('Username:').append(
            $('<input>').attr('id','credentials-username').attr('type','text').addClass('isSetting').addClass('validate-required')
          )
        ).append(
          $('<label>').attr('for','credentials-password').text('Password:').append(
            $('<input>').attr('id','credentials-password').attr('type','password').addClass('isSetting').addClass('validate-required')
          )
        ).append(
          $('<button>').text('Login').addClass('enter-to-submit').click(function(){
            if ($('#server').val() == '') {
              $('#server').val($('#server').attr('placeholder'));
            }
            if (($('#server').val() != '') && ($('#server').val().substring(0,3) != 'htt')) {
              $('#server').val('http://'+$('#server').val());
            }
            
            if (applyInput() === false) { return; }
            
            ignoreHashChange = true;
            location.hash = settings.credentials.username+'@'+settings.server;
            $('#user_and_host').text(settings.credentials.username+' @ '+settings.server);
            
            saveAndReload('overview');
          })
        )
      );
      
      // retrieve address hash from URL
      var adr = location.hash.replace('#', '').split('&')[0].split('@');
      if(adr.length == 2) {
        $('#server').val(adr[1]);
        $('#credentials-username').val(adr[0]);
      }
    break;
    case 'create new account':
      $('#menu').css('visibility', 'hidden');
      $('#page').html(
        $('<p>').text('Create a new account')
      ).append(
        $('<div>').addClass('description').text(
          'The server reports that an account has not yet been created. Please enter your desired account details.'
        )
      ).append(
        $('<div>').addClass('input_container').html(
          $('<label>').text('Username:').attr('for','credentials-new_username').append(
            $('<input>').attr('type','text').attr('id','credentials-new_username').val(settings.credentials.username).addClass('isSetting').addClass('validate-required')
          )
        ).append(
          $('<label>').text('Password:').attr('for','credentials-new_password').append(
            $('<input>').attr('type','password').attr('id','credentials-new_password').val(settings.credentials.password).addClass('isSetting').addClass('validate-required').bind('input',function(){
              if ($(this).val() != $('#repeat_password').val()) {
                $('#input-validation-info').text('The fields "Password" and "Repeat password" do not match.')
              }
              else {
                $('#input-validation-info').text('')
              }
            })
          )
        ).append(
          $('<label>').text('Repeat password:').attr('for','repeat_password').append(
            $('<input>').attr('type','password').attr('id','repeat_password').addClass('validate-required').bind('input',function(){
              if ($(this).val() != $('#credentials-new_password').val()) {
                $('#input-validation-info').text('The fields "Password" and "Repeat password" do not match.')
              }
              else {
                $('#input-validation-info').text('')
              }
            })
          ).append(
            $('<div>').attr('id','input-validation-info').addClass('red').text(
              'The fields "Password" and "Repeat password" do not match.'
            )
          )
        ).append(
          $('<button>').text('Create new account').addClass('enter-to-submit').click(function(){
            if ($('#repeat_password').val() != $('#credentials-new_password').val()) {
              $('#input-validation-info').text('The fields "Password" and "Repeat password" do not match.');
              return;
            }
            if (applyInput() === false) { return; }
            
            settings.credentials.username = settings.credentials.new_username;
            settings.credentials.password = settings.credentials.new_password;
            location.hash = settings.credentials.username+'@'+settings.server;
            $('#user_and_host').text(settings.credentials.username+' @ '+settings.server);
            
            saveAndReload('overview');
          })
        )
      );
    break;
    case 'overview':
      $('#page').html(
        $('<div>').addClass('description').html('An overview of MistServer statistics. General settings can be modified here.')
      ).append(
        $('<div>').addClass('input_container').html(
          $('<label>').attr('for','settings-config-name').text('Human readable name:').append(
            $('<input>').attr('id','settings-config-name').addClass('isSetting').attr('type','text')
          )
        ).append(
          $('<label>').text('Version:').append(
            $('<span>').attr('id','settings-config-version').addClass('isSetting')
          )
        ).append(
          $('<label>').text('Version check:').addClass('LTS-only').append(
            $('<span>').attr('id','version-check')
          )
          /* the basepath value is not used atm
        ).append(
          $('<label>').attr('for','settings-config-basePath').text('Base path:').append(
            $('<input>').attr('id','settings-config-basePath').addClass('isSetting').attr('type','text')
          ) */
        ).append(
          $('<label>').text('Server time:').append(
            $('<span>').attr('id','settings-config-time')
          )
        ).append(
          $('<label>').text('Current streams:').append(
            $('<span>').attr('id', 'cur_streams_online').text('Retrieving data..')
          )
        ).append(
          $('<label>').text('Current viewers:').append(
            $('<span>').attr('id', 'cur_num_viewers').text('Retrieving data..')
          )
        ).append(
          $('<div>').addClass('description').html('Tick the box below to force an immediate settings save. This differs from a regular save to memory and file save on exit by saving directly to file while operating. This may slow server processes for a short period of time.')
        ).append(
          $('<label>').attr('for','force-json-save').text('Force JSON file save:').append(
            $('<input>').attr('id','force-json-save').attr('type','checkbox')
          )
        ).append(
          $('<button>').text('Save').addClass('enter-to-submit').click(function(){
            if (applyInput() === false) { return; }
            if ($('#force-json-save').is(':checked')) {
              if(confirmDelete('Are you sure you want to force a JSON save?')) {
                if (applyInput() === false) { return; }
                var sendData = $.extend({},settings.settings);
                delete sendData.logs;
                delete sendData.statistics;
                delete sendData.capabilities;
                $('body').append(
                  $('<div>').attr('id', 'shield').text('Loading, please wait..')
                );
                getData(function(returnedData){
                  settings.settings = returnedData;
                  getData(function(returnedData){
                    showTab('overview');
                    $('#shield').remove();
                  },{'save': true});
                  
                },sendData);
              }
            }
            else {
              saveAndReload('overview');
            }
          })
        )
      );
      if (settings.settings.config.host) {
        $('.input_container').first().prepend(
          $('<label>').attr('for','settings-config-host').text('Host:').append(
            $('<span>').attr('id','settings-config-host').addClass('isSetting').attr('type','text')
          )
        );
      }
      
      enterSettings();
      $('#settings-config-time').text(formatDateLong(settings.settings.config.time));
      
      if (settings.settings.LTS) {
        if ((!settings.settings.update) || (!defaults.update.lastchecked) || ((new Date()).getTime() - defaults.update.lastchecked > 3600000)) {
          getData(function(data){
            settings.settings.update = data.update;
            defaults.update.lastchecked = (new Date()).getTime();
            
            if (settings.settings.update.uptodate) {
              $('#version-check').addClass('green').text('Your version is up to date.')
            }
            else {
              $('#version-check').addClass('red').text('Version outdated!').append(
                $('<button>').text('Update').click(function(){
                  settings.settings.autoupdate = true;
                  saveAndReload('overview');
                })
              )
            }
          },{checkupdate: true});
        }
        else {
          if (settings.settings.update.uptodate) {
            $('#version-check').text('Your version is up to date.').addClass('green')
          }
          else {
            $('#version-check').addClass('red').text('Version outdated!').append(
              $('<button>').text('Update').click(function(){
                settings.settings.autoupdate = true;
                saveAndReload('overview');
              })
            )
          }
        }
      }
      
      theInterval = setInterval(function(){
        updateOverview();
      },10000);
      updateOverview();
      
      if (!settings.settings.config.capabilities) { saveAndReload(); }
    break;
    case 'protocols':
      var $tbody = $('<tbody>').attr('id','protocols-tbody');
      
      $('#page').html(
        $('<div>').addClass('description').html(
          'This is an overview of the protocols that have been configured on MistServer.'
        )
      ).append(
        $('<table>').html(
          $('<thead>').html(
            $('<tr>').html(
              $('<th>').text('Protocol')
            ).append(
              $('<th>').text('Status')
            ).append(
              $('<th>').text('Settings')
            ).append(
              $('<th>')
            )
          )
        ).append(
          $tbody
        )
      ).append(
        $('<button>').text('New').click(function(){
          showTab('edit protocol','_new_');
        })
      );
      
      for (var index in settings.settings.config.protocols) {
        theProtocol = settings.settings.config.protocols[index];
        $tbody.append(
          $('<tr>').data('protocol',index).html(
            $('<td>').text(theProtocol.connector)
          ).append(
            $('<td>').attr('id','status-of-'+index).html(formatStatus(theProtocol))
          ).append(
            $('<td>').text(displayProtocolSettings(theProtocol))
          ).append(
            $('<td>').html(
              $('<button>').text('Edit').click(function(){
                showTab('edit protocol',$(this).parent().parent().data('protocol'))
              })
            ).append(
              $('<button>').text('Delete').click(function(){
                var protocolID = $(this).parent().parent().data('protocol');
                if (confirmDelete('Are you sure you want to delete the protocol "'+settings.settings.config.protocols[protocolID].connector+'"?')) {
                  settings.settings.config.protocols.splice(protocolID,1);
                  saveAndReload('protocols');
                }
              })
            )
          )
        );
      }
      
      theInterval = setInterval(function(){
        updateProtocols();
      },10000);
      updateProtocols();
    break;
    case 'edit protocol':
      var objpath;
      if (streamName == '_new_') {
        $('#page').html(
          $('<p>').text('Adding a new protocol')
        );
        objpath = 'newProtocol';
      }
      else {
        $('#page').html(
          $('<p>').text('Editing protocol "'+settings.settings.config.protocols[streamName].connector+'"')
        );
        objpath = 'settings.config.protocols['+streamName+']';
      }
      currentConnectors = [];
      for (var index in settings.settings.config.protocols) {
        currentConnectors.push(settings.settings.config.protocols[index].connector.replace('.exe',''));
      }
      
      var $selectProtocol = $('<select>').attr('id','protocol-connector').attr('objpath',objpath+'.connector').addClass('isSetting').change(function(){
        buildProtocolFields($(this).val(),objpath,streamName);
      });
      
      $('#page').append(
        $('<div>').addClass('input_container').html(
          $('<label>').text('Protocol:').attr('for','protocol-connector').append(
            $selectProtocol
          )
        ).append(
          $('<div>').addClass('description').attr('id','protocol-description')
        ).append(
          $('<div>').attr('id','protocol-fields')
        ).append(
          $('<button>').addClass('enter-to-submit').text('Save').click(function(){
            if (streamName == '_new_') {
              settings.newProtocol = {};
              if (applyInput() === false) { return; }
              if (!settings.settings.config.protocols) { settings.settings.config.protocols = []; }
              settings.settings.config.protocols.push(settings.newProtocol);
              delete settings.newProtocol;
            }
            else {
              if (applyInput() === false) { return; }
            }
            saveAndReload('protocols');
          })
        ).append(
          $('<button>').text('Cancel').addClass('escape-to-cancel').click(function(){
            showTab('protocols');
          })
        )
      );
      
      for (var index in settings.settings.capabilities.connectors) {
        $selectProtocol.append(
          $('<option>').val(index).text(index)
        );
      }
      
      if (streamName != '_new_') {
        enterSettings();
      }
      buildProtocolFields($selectProtocol.val(),objpath,streamName);
      
      
    break;
    case 'streams':
      var $tbody = $('<tbody>').attr('id','streams-tbody');
      
      $('#page').html(
        $('<div>').addClass('description').html(
          'This is an overview of the streams that have been configured on MistServer.<br>You can sort them by clicking the colomn headers that have symbols and filter them using the checkboxes.<br><br>'
        )
      ).append(
        $('<div>').html(
           $('<input>').attr('type','checkbox').attr('id','stream-filter-recorded').attr('checked','checked')
        ).append(
           $('<label>').text('Show pre-recorded streams ').attr('for','stream-filter-recorded').css('display','inline')
        ).append(
          $('<input>').attr('type','checkbox').attr('id','stream-filter-live').attr('checked','checked')
        ).append(
          $('<label>').text('Show live streams').attr('for','stream-filter-live').css('display','inline')
        )
      ).append(
        $('<table>').addClass('sortable').html(
          $('<thead>').html(
            $('<tr>').html(
              $('<th>').addClass('sort-type-string sortdesc').text('Name')
            ).append(
              $('<th>').addClass('sort-type-string').text('Type')
            ).append(
              $('<th>').addClass('sort-type-int').addClass('align-right').text('Viewers')
            ).append(
              $('<th>').addClass('sort-type-string').text('Status')
            ).append(
              $('<th>').addClass('dontsort')
            ).append(
              $('<th>').addClass('dontsort')
            )
          )
        ).append(
          $tbody
        )
      ).append(
        $('<button>').text('New').click(function(){
          showTab('edit stream','_new_');
        })
      );
      $('.sortable').stupidtable();
      
      for (var index in settings.settings.streams) {
        var theStream = settings.settings.streams[index];
        
        //backwards compatibility
        if ((theStream.source == undefined) && (theStream.channel)) {
          theStream.source = theStream.channel.URL;
        }
        
        $tbody.append(
          $('<tr>').data('stream',index).html(
            $('<td>').text(index)
          ).append(
            $('<td>').addClass('isLive').text(isLive(theStream.source) ? 'Live' : 'Recorded')
          ).append(
            $('<td>').attr('id','viewers-of-'+index).text(0).addClass('align-right')
          ).append(
            $('<td>').attr('id','status-of-'+index).html(formatStatus(theStream))
          ).append(
            $('<td>').html(
              $('<button>').text('Embed').click(function(){
                showTab('embed',$(this).parent().parent().data('stream'))
              })
            )
          ).append(
            $('<td>').html(
              $('<button>').text('Edit').click(function(){
                showTab('edit stream',$(this).parent().parent().data('stream'))
              })
            ).append(
              $('<button>').text('Delete').click(function(){
                var streamName = $(this).parent().parent().data('stream');
                if (confirmDelete('Are you sure you want to delete the stream "'+streamName+'"?')) {
                  delete settings.settings.streams[streamName];
                  saveAndReload('streams');
                }
              })
            )
          )
        );
      }
      
      theInterval = setInterval(function(){
        updateStreams();
      },10000);
      updateStreams();
      
      $('#stream-filter-recorded,#stream-filter-live').click(function(){
        filterTable();
      });
    break;
    case 'edit stream':
      if (streamName == '_new_') {
        $('#page').html(
          $('<p>').text('Adding a new stream')
        );
      }
      else {
        $('#page').html(
          $('<p>').text('Editing stream "'+streamName+'"')
        );
      }
      $('#page').append(
        $('<div>').addClass('input_container').html(
          $('<label>').text('Stream name:').attr('for','settings-streams-'+streamName+'-name').append(
            $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-name').addClass('isSetting').addClass('validate-lowercase-alphanumeric_-firstcharNaN').addClass('validate-required')
          )
        ).append(
          $('<label>').text('Source:').attr('for','settings-streams-'+streamName+'-source').attr('title','The path to the stream, usually "/path/to/filename.dtsc" for files or "push://hostname/streamname" for live streams.').append(
            $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-source').addClass('isSetting').addClass('validate-required').keyup(function(){
              if(isLive($(this).val())){
                $('.live-only').show();
              }
              else{
                $('.live-only').hide();
                $('.live-only').children('label').children('input').val('');
              }
            })
          )
        ).append(
          $('<label>').text('Buffer time:').addClass('live-only').attr('for','settings-streams-'+streamName+'-DVR').append(
            $('<span>').addClass('unit').text('[ms]')
          ).append(
            $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-DVR').attr('placeholder','2 keyframes').addClass('isSetting').addClass('').addClass('validate-positive-integer')
          )
        ).append(
          $('<label>').text('Record to:').addClass('live-only').addClass('LTS-only').attr('for','settings-streams-'+streamName+'-record').attr('title','The path to the file to record to. Leave this field blank if you do not wish to record to file.').append(
            $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-record').addClass('isSetting')
          )
        ).append(
          $('<label>').text('Cut first section:').addClass('live-only').addClass('LTS-only').attr('for','settings-streams-'+streamName+'-cut').attr('title','Remove the first part of a stream.').append(
            $('<span>').addClass('unit').text('[ms]')
          ).append(
            $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-cut').addClass('isSetting').addClass('validate-positive-integer')
          )
        ).append(
          $('<br>')
        ).append(
          $('<span>').addClass('LTS-only').html(
            $('<p>').text('Encrypt this stream')
          ).append(
            $('<div>').addClass('description').text(
              'To enable encryption, the Licene Acquisition URL must be entered, as well as either the content key or the key ID and seed.'
            )
          ).append(
            $('<label>').text('Licence Acquisition URL:').attr('for','settings-streams-'+streamName+'-la_url').append(
              $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-la_url').addClass('isSetting')
            )
          ).append(
            $('<br>')
          ).append(
            $('<label>').text('Content key:').attr('for','settings-streams-'+streamName+'-contentkey').append(
              $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-contentkey').addClass('isSetting')
            )
          ).append(
            $('<span>').text('- or -').addClass('description')
          ).append(
            $('<label>').text('Key ID:').attr('for','settings-treams-'+streamName+'-keyid').append(
              $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-keyid').addClass('isSetting')
            )
          ).append(
            $('<label>').text('Key seed:').attr('for','settings-streams-'+streamName+'-keyseed').append(
              $('<input>').attr('type','text').attr('id','settings-streams-'+streamName+'-keyseed').addClass('isSetting')
            )
          )
        ).append(
          $('<button>').addClass('enter-to-submit').text('Save').click(function(){
            var newName = $('#settings-streams-'+streamName+'-name').val();
            if (streamName != newName) {
              if (!settings.settings.streams) { settings.settings.streams = {}; }
              settings.settings.streams[streamName] = {};
              if (applyInput() === false) { return; }
              settings.settings.streams[newName] = settings.settings.streams[streamName];
              delete settings.settings.streams[streamName];
            }
            else {
              if (applyInput() === false) { return; }
            }
            saveAndReload('streams');
          })
        ).append(
          $('<button>').text('Cancel').addClass('escape-to-cancel').click(function(){
            showTab('streams');
          })
        )
      );
      
      if (streamName != '_new_') {
        enterSettings();
      }
      
      if(isLive($('#settings-streams-'+streamName+'-source').val())){
        $('.live-only').show();
      }
      else{
        $('.live-only').hide();
        $('.live-only').children('label').children('input').val('');
      }
      $('.live-only').each(function(){
        var newtitle = [$(this).attr('title'),'Only applies to live streams.']
        $(this).attr('title',newtitle.join(' '));
      })
      
    break;
    case 'embed':
      var httpConnector = false;
      for (var index in settings.settings.config.protocols) {
        if ((settings.settings.config.protocols[index].connector == 'HTTP') || (settings.settings.config.protocols[index].connector == 'HTTP.exe')) {
          httpConnector = settings.settings.config.protocols[index];
        }
      }
      if (httpConnector) {
        var embedbase = 'http://'+parseURL(settings.server).host+':'+(httpConnector.port ? httpConnector.port : 8080)+'/';
        $('#page').html(
          $('<div>').addClass('input_container').html(
            $('<p>').text('Embed info for stream "'+streamName+'"')
          ).append(
            $('<label>').text('The info embed URL is:').append(
              $('<input>').attr('type','text').attr('readonly','readonly').val(embedbase+'info_'+streamName+'.js')
            )
          ).append(
            $('<label>').text('The embed URL is:').append(
              $('<input>').attr('type','text').attr('readonly','readonly').val(embedbase+'embed_'+streamName+'.js')
            )
          ).append(
            $('<label>').text('The embed code is:').css('overflow','hidden').append(
              $('<textarea>').val('<div>\n  <script src="'+embedbase+'embed_'+streamName+'.js"></' + 'script>\n</div>')
            )
          ).append(
            $('<button>').text('Back').addClass('escape-to-cancel').click(function(){
              showTab('streams');
            })
          )
        ).append(
          $('<p>').text('Preview:')
        ).append(
          $('<div>').attr('id','preview-container')
        );
        
        // jQuery doesn't work -> use DOM magic
        var script = document.createElement('script');
        script.src = embedbase+'embed_'+streamName+'.js';
        document.getElementById('preview-container').appendChild( script );
      }
      else {
        $('#page').html(
          $('<div>').addClass('description').addClass('red').text('Could not find a HTTP connector. Please add one on the "Protocols" page.')
        );
      }
    break;
    case 'limits':
      var $tbody = $('<tbody>');
      $('#page').html(
        $('<div>').addClass('description').text('This is an overview of the limits that have been configured on MistServer.')
      ).append(
        $('<table>').html(
          $('<thead>').html(
            $('<tr>').html(
              $('<th>').text('Applies to')
            ).append(
              $('<th>').text('Type')
            ).append(
              $('<th>').text('Name')
            ).append(
              $('<th>').text('Value')
            ).append(
              $('<th>')
            )
          )
        ).append(
          $tbody
        )
      ).append(
        $('<button>').text('New').click(function(){
          showTab('edit limit','_new_');
        })
      );
      
      for (var index in settings.settings.config.limits) {
        $tbody.append(
          $('<tr>').data('limit',['server',index]).html(
            $('<td>').text('The whole server')
          ).append(
            $('<td>').text(settings.settings.config.limits[index].type)
          ).append(
            $('<td>').text(limitShortToLong(settings.settings.config.limits[index].name))
          ).append(
            $('<td>').html(limitValueFormat(settings.settings.config.limits[index]))
          ).append(
            $('<td>').html(
              $('<button>').text('Edit').click(function(){
                showTab('edit limit',$(this).parent().parent().data('limit'));
              })
            ).append(
              $('<button>').text('Delete').click(function(){
                if (confirmDelete('Are you sure you want to delete the limit "Server: '+limitShortToLong(settings.settings.config.limits[index].name)+'"')) {
                  var which = $(this).parent().parent().data('limit')
                  delete settings.settings.config.limits[which[1]];
                  saveAndReload('limits');
                }
              })
            )
          )
        );
      }
      for (var stream in settings.settings.streams) {
        for (var index in settings.settings.streams[stream].limits) {
          $tbody.append(
            $('<tr>').data('limit',['stream-'+stream,index]).html(
              $('<td>').text('The stream "'+stream+'"')
            ).append(
              $('<td>').text(settings.settings.streams[stream].limits[index].type)
            ).append(
              $('<td>').text(limitShortToLong(settings.settings.streams[stream].limits[index].name))
            ).append(
              $('<td>').html(limitValueFormat(settings.settings.streams[stream].limits[index]))
            ).append(
              $('<td>').html(
                $('<button>').text('Edit').click(function(){
                  showTab('edit limit',$(this).parent().parent().data('limit'));
                })
              ).append(
                $('<button>').text('Delete').click(function(){
                  if (confirmDelete('Are you sure you want to delete the limit "Stream "'+stream+'": '+limitShortToLong(settings.settings.streams[stream].limits[index].name)+'"')) {
                    var which = $(this).parent().parent().data('limit')
                    delete settings.settings.streams[stream].limits[which[1]];
                    saveAndReload('limits');
                  }
                })
              )
            )
          );
        }
      }
      
    break;
    case 'edit limit':
      var objpath;
      if (streamName == '_new_') {
        $('#page').html(
          $('<p>').text('Adding a new limit')
        )
        objpath = 'settings.newlimit[0]';
      }
      else {
        if (streamName[0] == 'server') {
          objpath = 'settings.config.limits';
          $('#page').html(
            $('<p>').html('Editing server limit "').append(
              $('<span>').attr('id','limit-name-tag')
            ).append('"')
          )
        }
        else {
          objpath = 'settings.streams.'+streamName[0].replace('stream-','')+'.limits';
          $('#page').html(
            $('<p>').html('Editing stream "'+streamName[0].replace('stream-','')+'" limit "').append(
              $('<span>').attr('id','limit-name-tag')
            ).append('"')
          );
        }
        objpath += '['+streamName[1]+']';
      }
      var $appliesto = $('<select>').attr('id','limit-applies-to').html(
        $('<option>').val('server').text('The whole server')
      );
      
      $('#page').append(
        $('<div>').addClass('input_container').html(
          $('<label>').text('Applies to:').attr('for','limit-applies-to').append(
            $appliesto
          )
        ).append(
          $('<label>').text('Type:').attr('for','limit-type').append(
            $('<select>').attr('id','limit-type').attr('objpath',objpath+'.type').addClass('isSetting').html(
              $('<option>').value('soft').text('Soft')
            ).append(
              $('<option>').value('hard').text('Hard')
            )
          )
        ).append(
          $('<div>').addClass('description').text(
            'The server will not allow a hard limit to be passed. A soft limit can be used to set alerts.'
          )
        ).append(
          $('<label>').text('Name:').attr('for','limit-name').append(
            $('<select>').attr('id','limit-name').attr('objpath',objpath+'.name').addClass('isSetting').html(
              $('<option>').val('kbps_max').text(limitShortToLong('kbps_max'))
            ).append(
              $('<option>').val('users').text(limitShortToLong('users'))
            ).append(
              $('<option>').val('geo').text(limitShortToLong('geo'))
            ).append(
              $('<option>').val('host').text(limitShortToLong('host'))
            ).change(function(){
              changeLimitName();
            })
          )
        ).append(
          $('<label>').text('Value:').attr('id','limit-value-label').attr('for','limit-value').append(
            $('<span>').addClass('unit').text('[bytes/s]')
          ).append(
            $('<input>').attr('type','text').attr('id','limit-value').attr('objpath',objpath+'.value').addClass('validate-required').addClass('isSetting')
          )
        ).append(
          $('<div>').attr('id','detailed-settings').css('overflow','hidden')
        ).append(
          $('<button>').text('Save').addClass('enter-to-submit').click(function(){
            if (streamName == '_new_') {
              settings.settings.newlimit = [{}];
            }
            if (applyInput() === false) { return; }
            
            moveLimit($('#limit-applies-to').val(),streamName,objpath);
            
            saveAndReload('limits');
          })
        ).append(
          $('<button>').text('Cancel').addClass('escape-to-cancel').click(function(){
            showTab('limits');
          })
        )
      );
      
      enterSettings();
      $("#limit-name-tag").text(limitShortToLong($('#limit-name').val()));
      changeLimitName($('#limit-value').val());
      
      for (var index in settings.settings.streams) {
        $appliesto.append(
          $('<option>').val('stream-'+index).text('The stream "'+index+'"')
        );
      }
      if (streamName != '_new_') {
        if (streamName[0] == 'config') {
          $appliesto.val('_server_');
        }
        else {
          $appliesto.val('stream-'+streamName[1]);
        }
      }
      
    break;
    case 'conversion':
      $('#page').html(
        $('<p>').text('Current conversions:')
      );
      
      if (settings.settings.conversion.status) {
        var $tbody = $('<tbody>');
        $('#page').append(
          $('<table>').html(
            $('<thead>').html(
              $('<tr>').html(
                $('<th>').text('Start time')
              ).append(
                $('<th>').text('Message')
              ).append(
                $('<th>').text('Details')
              )
            )
          ).append($tbody)
        );
        for (var index in settings.settings.conversion.status) {
          var $details = $('<table>');
          if (settings.settings.conversion.status[index].details) {
            $details.append(
              $('<tr>').html(
                $('<td>').text('Input file:')
              ).append(
                $('<td>').text(settings.settings.conversion.status[index].details.input)
              )
            ).append(
              $('<tr>').html(
                $('<td>').text('Output file:')
              ).append(
                $('<td>').text(settings.settings.conversion.status[index].details.output)
              )
            ).append(
              $('<tr>').html(
                $('<td>').text('Encoder:')
              ).append(
                $('<td>').text(settings.settings.conversion.status[index].details.encoder)
              )
            );
            if (settings.settings.conversion.status[index].details.video) {
              $details.append(
                $('<tr>').html(
                  $('<td>').text('Video included').attr('colspan',2)
                )
              );
              for (var s in settings.settings.conversion.status[index].details.video) {
                $details.append(
                  $('<tr>').html(
                    $('<td>').text('Video '+s+':')
                  ).append(
                    $('<td>').text(settings.settings.conversion.status[index].details.video[s])
                  )
                )
              }
            }
            if (settings.settings.conversion.status[index].details.audio) {
              $details.append(
                $('<tr>').html(
                  $('<td>').text('Audio included').attr('colspan',2)
                )
              );
              for (var s in settings.settings.conversion.status[index].details.audio) {
                $details.append(
                  $('<tr>').html(
                    $('<td>').text('Audio '+s+':')
                  ).append(
                    $('<td>').text(settings.settings.conversion.status[index].details.audio[s])
                  )
                )
              }
            }
          }
          
          $tbody.append(
            $('<tr>').html(
              $('<td>').text(formatDateLong(Number(index.replace('c_',''))/1000))
            ).append(
              $('<td>').html(formatConversionStatus(settings.settings.conversion.status[index])).attr('id','conversion-status-of-'+index)
            ).append(
              $('<td>').html($details)
            )
          )
        }
      }
      else {
        $('#page').append(
          $('<span>').text('None.')
        );
      }
      
      $('#page').append(
        $('<button>').text('New').click(function(){
          showTab('new conversion');
        })
      ).append(
        $('<button>').text('Clear list').click(function(){
          if (confirmDelete('Are you sure you want to clear the conversion list?')) {
              settings.settings.conversion.clear = true;
              saveAndReload('conversion');
          }
        })
      );
      
      if (settings.settings.conversion.status) {
        theInterval = setInterval(function(){
          updateConversions();
        },10000);
        updateConversions();
      }
    break;
    case 'new conversion':
      $('#page').html(
        $('<p>').text('New conversion')
      ).append(
        $('<div>').addClass('input_container').html(
          $('<div>').addClass('description').text('This page can be used to add a new conversion instruction.')
        ).append(
          $('<div>').addClass('description').text('First, specify the directory that contains the file you wish to convert. Then click the "Search for input files"-button to scan it for files.')
        ).append(
          $('<label>').text('Directory:').attr('for','conversion-query').append(
            $('<input>').attr('type','text').attr('id','conversion-query').val(defaults.conversion.inputdir).attr('placeholder','/path/to/directory')
          )
        ).append(
          $('<button>').text('Search for input files').addClass('enter-to-submit').click(function(){
            conversionDirQuery($('#conversion-query').val(),objpath);
          })
        ).append(
          $('<span>').attr('id','query-status').addClass('description').css('display','inline-block').css('margin-top','12px')
        )
      ).append(
        $('<div>').attr('id','conversion-input-file').addClass('input_container')
      ).append(
        $('<div>').attr('id','conversion-details').addClass('input_container')
      );
      
    break;
    case 'logs':
      $('#page').append(
        $('<span>').html(
          $('<input>').attr('type','checkbox').attr('id','logs-refresh').click(function(){
            if ($(this).is(':checked')) {
              defaults.logRefreshing[0] = true;
              theInterval = setInterval(function(){
                getData(function(data){
                  settings.settings.log = data.log;
                  $('#logs-table').remove();
                  $('#page').append(buildLogsTable());
                });
              },$('#logs-refresh-every').val());
              getData(function(data){
                settings.settings.log = data.log;
                $('#logs-table').remove();
                $('#page').append(buildLogsTable());
              });
            }
            else {
              defaults.logRefreshing[0] = false;
              clearInterval(theInterval);
            }
          })
        ).append(
          $('<span>').text(' Refresh logs every ')
        ).append(
          $('<select>').attr('id','logs-refresh-every').append(
            $('<option>').val(10000).text('10 seconds')
          ).append(
            $('<option>').val(30000).text('30 seconds')
          ).append(
            $('<option>').val(60000).text('minute')
          ).append(
            $('<option>').val(300000).text('5 minutes')
          ).append(
            $('<option>').val(600000).text('10 minutes')
          ).append(
            $('<option>').val(1800000).text('30 minutes')
          ).change(function(){
            defaults.logRefreshing[1] = $(this).val();
            if ($('#logs-refresh').is(':checked')) {
              clearInterval(theInterval);
              theInterval = setInterval(function(){
                getData(function(data){
                  settings.settings.log = data.log;
                  $('#logs-table').remove();
                  $('#page').append(buildLogsTable());
                });
              },$(this).val());
            }
            else {
              clearInterval(theInterval);
            }
          })
        )
      ).append(
        $('<button>').text('Purge logs').click(function(){
          settings.settings.clearstatlogs = true;
          saveAndReload('logs');
        })
      ).append(
        buildLogsTable()
      );
      
      getData(function(data){
        settings.settings.log = data.log;
        $('#logs-table').remove();
        $('#page').append(buildLogsTable());
      });
      
      //load values for the check- and selectbox and start the interval if applicable
      if (defaults.logRefreshing[0]) {
        $('#logs-refresh').attr('checked','checked');
        theInterval = setInterval(function(){
          getData(function(data){
            settings.settings.log = data.log;
            $('#logs-table').remove();
            $('#page').append(buildLogsTable());
          });
        },defaults.logRefreshing[1]);
      }
      $('#logs-refresh-every').val(defaults.logRefreshing[1]);
    break;
    case 'server stats':
      var $cont = $('<div>').addClass('input_container');
      
      $cont.append(
        $('<p>').text('CPU')
      );
      for (var index in settings.settings.capabilities.cpu) {
        if (settings.settings.capabilities.cpu.length > 1) {
          $cont.append(
            $('<span>').text('CPU '+index+1)
          );
        }
        for (var property in settings.settings.capabilities.cpu[index]) {
          $cont.append(
            $('<label>').text(property.charAt(0).toUpperCase()+property.slice(1)+':').append(
              $('<span>').text(seperateThousands(settings.settings.capabilities.cpu[index][property],' '))
            )
          );
        }
      }
      
      if (settings.settings.capabilities.mem) {
        $cont.append(
          $('<p>').text('Memory')
        ).append(
          $('<label>').text('Physical memory:').append(
            $('<table>').attr('id','stats-physical-memory')
          )
        ).append(
          $('<label>').text('Swap memory:').append(
            $('<table>').attr('id','stats-swap-memory')
          )
        );
      }
      
      if (settings.settings.capabilities.load) {
        $cont.append(
          $('<p>').text('CPU Load')
        ).append(
          $('<label>').text('Loading averages:').append(
            $('<table>').attr('id','stats-loading')
          )
        );
      }
      fillServerstatsTables(settings.settings);
      
      theInterval = setInterval(function(){
        updateServerstats();
      },10000);
      updateServerstats();
      
      $('#page').html($cont);
    break;
    case 'disconnect':
      showTab('login');
      $('#connection').addClass('red').removeClass('green').text('Disconnected');
      $('#user_and_host').text('');
      settings.settings = {};
      settings.credentials = {};
    break;
    default:
      $('#page').html(
        $('<div>').addClass('description').html('The page "'+tabName+'" was not found.')
      );
    break;
  }
  
  if ((settings.credentials.authstring) && (!settings.settings.LTS)) {
    $('.LTS-only input').add('.LTS-only select').add('.LTS-only button').attr('disabled','disabled');
    $('.LTS-only, .LTS-only p, .LTS-only label, .LTS-only button ').css('color','#b4b4b4');
    $('.LTS-only, .LTS-only > *').filter(':not(.LTSstuff_done)').each(function(){
      var t = [];
      if ($(this).attr('title')) {
        t.push($(this).attr('title'));
      }
      t.push('This is feature is only available in the LTS version.');
      $(this).attr('title',t.join(' ')).addClass('LTSstuff_done');
    });
  }
  else if (settings.settings.LTS) {
    $('.LTS-only').removeClass('LTS-only');
  }
}
