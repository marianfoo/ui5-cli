import test from "ava";
import init from "../../../lib/init/init.js";
import {fileURLToPath} from "node:url";
import sinon from "sinon";
import esmock from "esmock";

function getFixturePath(fixtureName) {
	return fileURLToPath(new URL("../../fixtures/init/" + fixtureName, import.meta.url));
}

test.afterEach.always(() => {
	sinon.restore();
});

test("Init for application", async (t) => {
	const projectConfig = await init({
		cwd: getFixturePath("application")
	});

	t.deepEqual(projectConfig, {
		specVersion: "3.0",
		type: "application",
		metadata: {
			name: "init-application"
		}
	});
});

test("Init for library", async (t) => {
	const projectConfig = await init({
		cwd: getFixturePath("library")
	});

	t.deepEqual(projectConfig, {
		specVersion: "3.0",
		type: "library",
		metadata: {
			name: "init-library"
		}
	});
});

test("Init for invalid project (Found 'webapp', 'src' and 'test' folders)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-webapp-src-test")
	}), {message:
	"Could not detect project type: Found 'webapp', 'src' and 'test' folders.\n" +
	"Applications should only have a 'webapp' folder.\n" +
	"Libraries should only have a 'src' and (optional) 'test' folder."});
});

test("Init for invalid project (Found 'webapp' and 'src' folders)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-webapp-src")
	}), {message:
	"Could not detect project type: Found 'webapp' and 'src' folders.\n" +
	"Applications should only have a 'webapp' folder.\n" +
	"Libraries should only have a 'src' and (optional) 'test' folder."});
});

test("Init for invalid project (Found 'webapp' and 'test' folders)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-webapp-test")
	}), {message:
	"Could not detect project type: Found 'webapp' and 'test' folders.\n" +
	"Applications should only have a 'webapp' folder.\n" +
	"Libraries should only have a 'src' and (optional) 'test' folder."});
});

test("Init for invalid project (Found 'test' folder but no 'src' folder)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-test")
	}), {message:
	"Could not detect project type: Found 'test' folder but no 'src' folder.\n" +
	"Applications should only have a 'webapp' folder.\n" +
	"Libraries should only have a 'src' and (optional) 'test' folder."});
});

test("Init for invalid project (Could not find 'webapp' or 'src' / 'test' folders)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid")
	}), {message:
	"Could not detect project type: Could not find 'webapp' or 'src' / 'test' folders.\n" +
	"Applications should only have a 'webapp' folder.\n" +
	"Libraries should only have a 'src' and (optional) 'test' folder."});
});

test("Init for invalid project (No package.json)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-no-package-json")
	}), {message: "Initialization not possible: Missing package.json file"});
});

test("Init for invalid project (Missing 'name' in package.json)", async (t) => {
	await t.throwsAsync(init({
		cwd: getFixturePath("invalid-missing-package-name")
	}), {message: "Initialization not possible: Missing 'name' in package.json"});
});

test.serial("Init with default arguments (throws fs.readFile error)", async (t) => {
	const fsReadFileStub = sinon.stub().withArgs("package.json", "utf8")
		.rejects(new Error("Some error from fs.readFile"));
	const init = await esmock("../../../lib/init/init", {
		"node:fs/promises": {
			readFile: fsReadFileStub
		}
	});
	await t.throwsAsync(init(), {
		message: "Some error from fs.readFile"
	});
});
