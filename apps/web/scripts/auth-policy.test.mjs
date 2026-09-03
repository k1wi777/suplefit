import assert from "node:assert/strict";
import test from "node:test";
import { getLoginDestination, getSafeDestination, isSafeRelativePath } from "../src/shared/lib/auth-policy.ts";

test("rejects protocol-relative login destinations", () => {
  assert.equal(isSafeRelativePath("//sitio-externo.example"), false);
  assert.equal(getSafeDestination("//sitio-externo.example", "user"), "/dashboard");
  assert.equal(getLoginDestination("//sitio-externo.example"), "/login?next=%2Fdashboard");
});

test("rejects absolute URLs and backslashes", () => {
  assert.equal(isSafeRelativePath("https://sitio-externo.example"), false);
  assert.equal(isSafeRelativePath("/\\sitio-externo.example"), false);
});

test("preserves only destinations allowed by role", () => {
  assert.equal(getSafeDestination("/orders?status=paid", "user"), "/orders?status=paid");
  assert.equal(getSafeDestination("/admin?tab=orders", "user"), "/dashboard");
  assert.equal(getSafeDestination("/dashboard", "admin"), "/admin");
});
