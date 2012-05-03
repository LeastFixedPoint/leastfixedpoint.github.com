function loadProjects() {
	var repositories = [];
	var bitbucketLoaded = false;
	var githubLoaded = false;
	
	function onLoaded() {
		if (bitbucketLoaded && githubLoaded) {
			onAllLoaded()
		}
	}
	
	function onAllLoaded() {
		var projectsElem = $('#projects')
		$('.loading', projectsElem).hide()
		
		repositories.sort(function(r1, r2) {
			return Date.parse(r2.updated) - Date.parse(r1.updated)
		})
		
		$.each(repositories, function(i, repo) {
			var date = new Date(repo.updated)
			projectsElem.append('<div class="item">'
				+ '<a class="title" href="' + repo.url + '">' + repo.name + '</a>'
				+ (repo.description ? ('<br><span class="description">' + repo.description + '</span>'): '')
				+ '<br><span class="date">updated ' + $.timeago(date) + '</span>'
				+ '</div>')
		})
	}

	$.getJSON('https://github.com/api/v2/json/repos/show/leastfixedpoint?callback=?', function(data, textStatus, jqXHR) {
		$.each(data.repositories, function(i, repo) {
			if (!repo.description || repo.fork) {
				return
			}
			
			repositories.push({
				updated: repo.pushed_at,
				description: repo.description,
				name: repo.name,
				url: repo.url,
			})
			
			githubLoaded = true
			onLoaded()
		})
	})
	
	$.getJSON('https://api.bitbucket.org/1.0/users/fixpoint?callback=?', function(data, textStatus, jqXHR) {
		$.each(data.repositories, function(i, repo) {
			if (!repo.description) {
				return
			}
			
			repositories.push({
				updated: repo.utc_last_updated,
				description: repo.description,
				name: repo.name,
				url: 'http://bitbucket.org/' + repo.owner + '/' + repo.slug,
			})
		})
		
		bitbucketLoaded = true
		onLoaded()
	})
}

function attachmentLink(att) {
	if (att.objectType == 'article') {
		return '<a class="title" href="' + att.url + '">' + att.displayName + '</a>'
	}
	
	if (att.objectType == 'photo') {
		return '<a href="' + att.fullImage.url + '"><img src="' + att.image.url + '"></a>'
	}
}

function loadStream() {
	$.getJSON('https://www.googleapis.com/plus/v1/people/102828540354552039760/activities/public?key=AIzaSyDDf2A5A28ERmwYw2-SP6LC9flX_KsvjlU', function(data, textStatus, jqXHR) {
		var streamElem = $('#stream')
		$('.loading', streamElem).hide()
		
		$.each(data.items, function(i, item) {
			streamElem.append('<div class="item">'
				+ (item.object.attachments ? (attachmentLink(item.object.attachments[0]) + '<br>') : '')
				+ (item.object.content ? ('<span class="description">' + item.object.content + '</span><br>') : '')
				+ '<div class="date"><a href="' + item.url + '">' + $.timeago(item.updated) + '</a></div>'
				+ '</div>')
		})
	})
}