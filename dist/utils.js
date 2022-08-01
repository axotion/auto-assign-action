"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchConfigurationFile = exports.chooseUsersFromGroups = exports.includesSkipKeywords = exports.chooseUsers = exports.chooseAssignees = exports.chooseReviewers = void 0;
const lodash_1 = __importDefault(require("lodash"));
const yaml = __importStar(require("js-yaml"));
function chooseReviewers(owner, config) {
    const { useReviewGroups, reviewGroups, numberOfReviewers, reviewers } = config;
    let chosenReviewers = [];
    const useGroups = useReviewGroups && Object.keys(reviewGroups).length > 0;
    if (useGroups) {
        chosenReviewers = chooseUsersFromGroups(owner, reviewGroups, numberOfReviewers);
    }
    else {
        chosenReviewers = chooseUsers(reviewers, numberOfReviewers, owner);
    }
    return chosenReviewers;
}
exports.chooseReviewers = chooseReviewers;
function chooseAssignees(owner, config) {
    const { useAssigneeGroups, assigneeGroups, addAssignees, numberOfAssignees, numberOfReviewers, assignees, reviewers, } = config;
    let chosenAssignees = [];
    const useGroups = useAssigneeGroups && Object.keys(assigneeGroups).length > 0;
    if (typeof addAssignees === 'string') {
        if (addAssignees !== 'author') {
            throw new Error("Error in configuration file to do with using addAssignees. Expected 'addAssignees' variable to be either boolean or 'author'");
        }
        chosenAssignees = [owner];
    }
    else if (useGroups) {
        chosenAssignees = chooseUsersFromGroups(owner, assigneeGroups, numberOfAssignees || numberOfReviewers);
    }
    else {
        const candidates = assignees ? assignees : reviewers;
        chosenAssignees = chooseUsers(candidates, numberOfAssignees || numberOfReviewers, owner);
    }
    return chosenAssignees;
}
exports.chooseAssignees = chooseAssignees;
function chooseUsers(candidates, desiredNumber, filterUser = '') {
    const filteredCandidates = candidates.filter((reviewer) => {
        return reviewer !== filterUser;
    });
    // all-assign
    if (desiredNumber === 0) {
        return filteredCandidates;
    }
    return lodash_1.default.sampleSize(filteredCandidates, desiredNumber);
}
exports.chooseUsers = chooseUsers;
function includesSkipKeywords(title, skipKeywords) {
    for (const skipKeyword of skipKeywords) {
        if (title.toLowerCase().includes(skipKeyword.toLowerCase()) === true) {
            return true;
        }
    }
    return false;
}
exports.includesSkipKeywords = includesSkipKeywords;
function chooseUsersFromGroups(owner, groups, desiredNumber) {
    let users = [];
    for (const group in groups) {
        users = users.concat(chooseUsers(groups[group], desiredNumber, owner));
    }
    return users;
}
exports.chooseUsersFromGroups = chooseUsersFromGroups;
function fetchConfigurationFile(client, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { owner, repo, path, ref } = options;
        const result = yield client.repos.getContents({
            owner,
            repo,
            path,
            ref,
        });
        const data = result.data;
        if (!data.content) {
            throw new Error('the configuration file is not found');
        }
        const configString = Buffer.from(data.content, 'base64').toString();
        const config = yaml.safeLoad(configString);
        return config;
    });
}
exports.fetchConfigurationFile = fetchConfigurationFile;
