import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectDetailsId } from "@/features/lists/model/selectors";
import { detailsClosed } from "@/features/lists/model/viewSlice";
import Dialog from "@/shared/ui/Dialog/Dialog";

import { selectTodoById } from "../../model/selectors";
import TaskDetails from "../TaskDetails/TaskDetails";

import styles from "./TaskDetailsDialog.module.scss";

// Task details in a dialog on narrow screens
const TaskDetailsDialog = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const id = useAppSelector(selectDetailsId);
  const todo = useAppSelector((state) => (id === null ? undefined : selectTodoById(state, id)));
  const close = () => dispatch(detailsClosed());

  return (
    <Dialog open={todo !== undefined} label={t("details.title")} onClose={close} className={styles.dialog}>
      {todo ? <TaskDetails key={todo.id} todo={todo} onClose={close} /> : null}
    </Dialog>
  );
};

export default TaskDetailsDialog;
