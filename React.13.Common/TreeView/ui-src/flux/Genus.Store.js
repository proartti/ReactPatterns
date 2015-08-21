import lodash from 'lodash';
import Reflux from 'reflux';

import Actions from './Actions';

var _genusList = [];
var _currentGenusNode = {};

function _gotGenusList(data) {
	_genusList = data;
	_currentGenusNode = _getSelected(_genusList);
	if (_currentGenusNode == null) _currentGenusNode = _genusList[0];
	GenusStore.trigger();
}
function _setGenusList() { Actions.apiSetGenusList(_genusList); }

function _selectGenusNode(node) {
	if (_currentGenusNode.type == 'specie') {
		var genus = lodash.findWhere(_genusList, {title: _currentGenusNode.genus});
		var genusIndex = lodash.indexOf(_genusList, genus);
		var child = lodash.findWhere(genus.children, {nodeid: _currentGenusNode.nodeid});
		var childIndex = lodash.indexOf(genus.children, child);
		_genusList[genusIndex].children[childIndex].selected = false;
	} else {
		var genusNodeIndex = lodash.indexOf(_genusList, _currentGenusNode);
		_genusList[genusNodeIndex].selected = false;
	}

	_currentGenusNode = node;
	if (_currentGenusNode.type == 'specie') {
		var genus = lodash.findWhere(_genusList, {title: _currentGenusNode.genus});
		var genusIndex = lodash.indexOf(_genusList, genus);
		var child = lodash.findWhere(genus.children, {nodeid: _currentGenusNode.nodeid});
		var childIndex = lodash.indexOf(genus.children, child);
		_genusList[genusIndex].children[childIndex].selected = true;
	} else {
		var genusNodeIndex = lodash.indexOf(_genusList, _currentGenusNode);
		_genusList[genusNodeIndex].selected = true;
	}

	GenusStore.trigger();
	_setGenusList();
}

function _setGenusNodeClosed(node) {
	var selectedNode = lodash.findWhere(_genusList, {nodeid: node.nodeid});
	var selectedNodeIndex = lodash.indexOf(_genusList, selectedNode);
	var isClosed;
	if (lodash.has(_genusList[selectedNodeIndex], "closed")) isClosed = _genusList[selectedNodeIndex].closed;
	else isClosed = true;
	_genusList[selectedNodeIndex].closed = !isClosed;

	GenusStore.trigger();
	_setGenusList();
}

function _getSelected(tree) {
	var result = null;
	lodash.each(tree, function(item) {
		if (item.selected) result = item;
		if(result == null && lodash.has(item, "children") && item.children.length > 0)
			result = _getSelected(item.children);
	});
	return result;
}

function _genusStoreInit() {
	this.listenTo(Actions.gotGenusList, this.onGotGenusList);
	this.listenTo(Actions.selectGenusNode, this.onSelectGenusNode);
	this.listenTo(Actions.setGenusNodeClosed, this.onSetGenusNodeClosed);
}

var GenusStoreObject = {
	init: _genusStoreInit,
	onGotGenusList: _gotGenusList,
	onSelectGenusNode: _selectGenusNode,
	onSetGenusNodeClosed: _setGenusNodeClosed,

	getGenusList: function() { return _genusList; },
	getCurrentGenusNode: function() { return _currentGenusNode; }
}
const GenusStore = Reflux.createStore(GenusStoreObject);
export default GenusStore;
