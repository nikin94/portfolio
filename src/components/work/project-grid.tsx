import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { filterProjects, type ProjectFilter } from "@/config/projects";
import { easeOutExpo } from "@/lib/motion";

import { ProjectCard } from "./project-card";
import { ProjectFilterControl } from "./project-filter";

/**
 * Work grid: a platform filter over a responsive card grid. Filtering animates
 * with `layout` + `AnimatePresence` so cards reflow smoothly. `all` is the
 * default, so the server render and first paint show every project (no empty
 * grid before JS, no hydration mismatch); animations only kick in on change.
 */
export const ProjectGrid = () => {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const visible = filterProjects(filter);

  return (
    <div>
      <ProjectFilterControl value={filter} onChange={setFilter} />

      <motion.ul
        layout
        className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: easeOutExpo }}
            >
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
