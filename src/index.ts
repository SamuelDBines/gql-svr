import fs from "fs";
import path from "path";
import { parse, Kind, visit } from "graphql";

function findUnusedFragments(docString: string) {
  const ast = parse(docString);

  const definedFragments = new Map();
  const fragmentSpreadsByFragment = new Map();
  const fragmentSpreadsInOperations = new Set();
  for (const def of ast.definitions) {
    if (def.kind === Kind.FRAGMENT_DEFINITION) {
      definedFragments.set(def.name.value, def);

      const spreads = new Set();
      visit(def, {
        FragmentSpread(node) {
          spreads.add(node.name.value);
        },
      });

      fragmentSpreadsByFragment.set(def.name.value, spreads);
    } else if (def.kind === Kind.OPERATION_DEFINITION) {
      // Collect fragments used directly in top-level operations
      visit(def, {
        FragmentSpread(node) {
          fragmentSpreadsInOperations.add(node.name.value);
        },
      });
    }
  }

  const usedFragments = new Set();
  const stack = [...fragmentSpreadsInOperations];

  while (stack.length) {
    const name = stack.pop();
    if (usedFragments.has(name)) continue;
    usedFragments.add(name);

    const spreads = fragmentSpreadsByFragment.get(name);
    if (spreads) {
      for (const childName of spreads) {
        if (!usedFragments.has(childName)) {
          stack.push(childName);
        }
      }
    }
  }

  const unused = [];
  for (const name of definedFragments.keys()) {
    if (!usedFragments.has(name)) {
      unused.push(name);
    }
  }

  return unused;
}

export const loadGql = (filePath: string, seen = new Set()) => {
  const fullPath = path.resolve(filePath);
  if (seen.has(fullPath)) return "";
  seen.add(fullPath);

  const raw = fs.readFileSync(fullPath, "utf8");
  const dir = path.dirname(fullPath);

  const lines = raw.split("\n");
  let result = "";

  for (const line of lines) {
    const match = line.match(/^#import\s+["'](.+)["']/);
    if (match) {
      const importPath = path.join(dir, match[1]);
      result += loadGql(importPath, seen) + "\n";
    } else {
      result += line + "\n";
    }
  }

  if (seen.size === 1) {
    const unused = findUnusedFragments(result);
    if (unused.length) {
      console.warn(
        `[GraphQL] Unused fragments in ${fullPath}: ${unused.join(", ")}`
      );
      throw new Error(`Unused GraphQL fragments: ${unused.join(", ")}`);
    }
  }

  return result;
};

export default { loadGql };
