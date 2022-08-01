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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequest = void 0;
const core = __importStar(require("@actions/core"));
const utils = __importStar(require("./utils"));
const pull_request_1 = require("./pull_request");
function handlePullRequest(client, context, config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!context.payload.pull_request) {
            throw new Error('the webhook payload is not exist');
        }
        const { pull_request: event } = context.payload;
        const { title, draft, user, number } = event;
        const { skipKeywords, useReviewGroups, useAssigneeGroups, reviewGroups, assigneeGroups, addReviewers, addAssignees, filterLabels, runOnDraft, } = config;
        if (skipKeywords && utils.includesSkipKeywords(title, skipKeywords)) {
            core.info('Skips the process to add reviewers/assignees since PR title includes skip-keywords');
            return;
        }
        if (!runOnDraft && draft) {
            core.info('Skips the process to add reviewers/assignees since PR type is draft');
            return;
        }
        if (useReviewGroups && !reviewGroups) {
            throw new Error("Error in configuration file to do with using review groups. Expected 'reviewGroups' variable to be set because the variable 'useReviewGroups' = true.");
        }
        if (useAssigneeGroups && !assigneeGroups) {
            throw new Error("Error in configuration file to do with using review groups. Expected 'assigneeGroups' variable to be set because the variable 'useAssigneeGroups' = true.");
        }
        const owner = user.login;
        const pr = new pull_request_1.PullRequest(client, context);
        if (filterLabels !== undefined) {
            if (filterLabels.include !== undefined && filterLabels.include.length > 0) {
                core.info(`PR instance ${JSON.stringify(pr)}`);
                core.info(`lables to include ${JSON.stringify(filterLabels.include)}`);
                core.info(`context ${JSON.stringify(context)}`);
                const hasLabels = pr.hasAnyLabel(filterLabels.include);
                if (!hasLabels) {
                    core.info(`PR instance ${JSON.stringify(pr)} | lables to include ${JSON.stringify(filterLabels.include)} | context ${JSON.stringify(context)} | Skips the process to add reviewers/assignees since PR is not tagged with any of the filterLabels.include`);
                    return;
                }
            }
            if (filterLabels.exclude !== undefined && filterLabels.exclude.length > 0) {
                const hasLabels = pr.hasAnyLabel(filterLabels.exclude);
                if (hasLabels) {
                    core.info('Skips the process to add reviewers/assignees since PR is tagged with any of the filterLabels.exclude');
                    return;
                }
            }
        }
        if (addReviewers) {
            try {
                const reviewers = utils.chooseReviewers(owner, config);
                if (reviewers.length > 0) {
                    yield pr.addReviewers(reviewers);
                    core.info(`Added reviewers to PR #${number}: ${reviewers.join(', ')}`);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    core.warning(error.message);
                }
            }
        }
        if (addAssignees) {
            try {
                const assignees = utils.chooseAssignees(owner, config);
                if (assignees.length > 0) {
                    yield pr.addAssignees(assignees);
                    core.info(`Added assignees to PR #${number}: ${assignees.join(', ')}`);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    core.warning(error.message);
                }
            }
        }
    });
}
exports.handlePullRequest = handlePullRequest;
