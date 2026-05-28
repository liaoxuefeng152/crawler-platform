#!/usr/bin/env python3
"""
Workflow Coordinator - 中央工作流协调器
负责协调9阶段工作流的自动化执行，确保工作流不会中途停下
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

class WorkflowCoordinator:
    """工作流协调器 - 确保工作流完整执行"""

    # 🔥 排除监听的目录（防止无限循环）
    WATCH_EXCLUDE_DIRS = [
        '.claude',      # Claude配置目录
        '.az',          # 工作流输出目录
        'node_modules',  # 依赖目录
        '.next',        # Next.js构建目录
        '.git',         # Git目录
        'dist',         # 打包目录
        'build',        # 构建目录
    ]

    def __init__(self, project_root=None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.state_file = self.project_root / ".az" / "workflow-state.json"
        self.active_bridge = self.project_root / ".az" / "plan-xxx" / "communication" / "active-bridge.md"
        self.max_iterations = 20  # 🔥 强制最大迭代次数限制（从10增加到20，更宽松）
        self.current_iteration = 0
        self.lock_file = self.project_root / ".claude" / ".workflow-lock"

    def load_state(self):
        """加载工作流状态"""
        if self.state_file.exists():
            with open(self.state_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    def save_state(self, state):
        """保存工作流状态"""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2, ensure_ascii=False)

    def get_current_stage(self):
        """获取当前应该执行的阶段"""
        state = self.load_state()
        if not state:
            return "Plan"

        # 🔥 检查工作流是否已完成
        if state.get("status") == "completed":
            print("❌ 工作流已完成，禁止继续执行")
            print(f"完成时间: {state.get('endTime', 'N/A')}")
            print(f"完成消息: {state.get('completionMessage', 'N/A')}")
            return None

        # 🔥 检查迭代次数是否超限
        self.current_iteration += 1
        if self.current_iteration > self.max_iterations:
            print(f"❌ 迭代次数超过最大限制（{self.max_iterations}次），停止执行")
            print("请检查工作流状态或重置迭代计数")
            return None

        # 检查是否有阻塞
        if state.get("isBlocked", False):
            blockers = state.get("blockers", [])
            print(f"❌ 工作流被阻塞: {blockers}")
            print("请解决阻塞问题后继续")
            return None

        # 检查是否已进入下一阶段
        current_stage = state.get("currentStage")
        current_substage = state.get("currentSubstage")
        stages_completed = state.get("stagesCompleted", [])

        print(f"📍 当前阶段: {current_stage}")
        print(f"📍 当前子阶段: {current_substage}")
        print(f"✅ 已完成阶段: {', '.join(stages_completed)}")

        # 判断是否需要进入下一阶段
        if self._is_stage_complete(state):
            next_stage = self._get_next_stage(current_stage)
            if next_stage:
                print(f"🚀 {current_stage}阶段已完成，进入{next_stage}阶段")
                self._transition_to_stage(state, next_stage)
                return next_stage

        return current_stage

    def _is_stage_complete(self, state):
        """判断当前阶段是否完成"""
        current_stage = state.get("currentStage")
        stage_status = state.get("stageStatus", {}).get(current_stage, {})

        # 检查阶段状态
        if stage_status.get("status") == "completed":
            return True

        # 检查关键里程碑
        if current_stage == "Dev":
            # Dev阶段需要后端+前端都完成
            return stage_status.get("backendCompleted") and stage_status.get("frontendCompleted")

        if current_stage == "Test":
            # Test阶段需要后端测试+前端E2E都完成
            return stage_status.get("backendTestPassed") and stage_status.get("e2eTestPassed")

        if current_stage == "SecurityReview":
            # SecurityReview阶段需要安全审查通过
            return stage_status.get("securityCheckPassed", False)

        return stage_status.get("status") == "completed"

    def _get_next_stage(self, current_stage):
        """获取下一阶段"""
        stages = ["Plan", "Clarify", "Tasks", "Dev", "OpenAPI", "Test", "Verification", "QA", "SecurityReview"]
        try:
            current_index = stages.index(current_stage)
            if current_index < len(stages) - 1:
                return stages[current_index + 1]
        except ValueError:
            pass
        return None

    def _transition_to_stage(self, state, next_stage):
        """过渡到下一阶段"""
        state["currentStage"] = next_stage
        state["stageStatus"][next_stage] = {
            "status": "in_progress",
            "startedAt": datetime.now().isoformat()
        }
        state["stagesCompleted"].append(next_stage)
        state["lastUpdate"] = datetime.now().isoformat()
        self.save_state(state)

    def mark_stage_complete(self, stage, substage=None):
        """标记阶段完成"""
        state = self.load_state()
        if not state:
            print("❌ 工作流状态不存在，请先启动工作流")
            return False

        stage_status = state["stageStatus"].setdefault(stage, {})

        if substage:
            # 标记子阶段完成
            stage_status[f"{substage}Completed"] = True
            print(f"✅ {stage}阶段的{substage}已完成")
        else:
            # 标记整个阶段完成
            stage_status["status"] = "completed"
            stage_status["completedAt"] = datetime.now().isoformat()
            print(f"✅ {stage}阶段已完成")

        state["lastUpdate"] = datetime.now().isoformat()
        self.save_state(state)
        return True

    def add_blocker(self, blocker):
        """添加阻塞问题"""
        state = self.load_state()
        if state:
            state["isBlocked"] = True
            state["blockers"].append(blocker)
            state["lastUpdate"] = datetime.now().isoformat()
            self.save_state(state)
            print(f"⚠️ 已添加阻塞: {blocker}")

    def remove_blocker(self, blocker):
        """移除阻塞问题"""
        state = self.load_state()
        if state and blocker in state.get("blockers", []):
            state["blockers"].remove(blocker)
            if not state["blockers"]:
                state["isBlocked"] = False
            state["lastUpdate"] = datetime.now().isoformat()
            self.save_state(state)
            print(f"✅ 已解决阻塞: {blocker}")

    def should_auto_continue(self):
        """判断是否应该自动继续"""
        state = self.load_state()
        return state and state.get("autoContinue", False)

    def print_workflow_summary(self):
        """打印工作流摘要"""
        state = self.load_state()
        if not state:
            print("❌ 工作流状态不存在")
            return

        print("\n" + "="*60)
        print(f"📊 工作流状态摘要 - {state.get('workflow')}")
        print("="*60)
        print(f"开始时间: {state.get('startTime')}")
        print(f"最后更新: {state.get('lastUpdate')}")
        print(f"当前阶段: {state.get('currentStage')}")
        print(f"当前子阶段: {state.get('currentSubstage')}")
        print(f"已完成阶段: {len(state.get('stagesCompleted', []))}/9")
        print(f"迭代次数: {self.current_iteration}/{self.max_iterations}")
        print(f"工作流状态: {'🚧 进行中' if state.get('isBlocked') else '✅ 正常'}")
        print(f"锁状态: {'🔒 已锁定' if self.is_lock_acquired() else '🔓 未锁定'}")

        if state.get("reworkHistory"):
            print(f"\n🔄 返工历史: {len(state['reworkHistory'])}次")
            for rework in state["reworkHistory"]:
                round = rework.get('round', rework.get('iteration', '?'))
                reason = rework.get('reason', rework.get('issue', 'Unknown'))
                print(f"   - {rework['stage']} 第{round}轮: {reason}")

        print("="*60 + "\n")

    def acquire_lock(self, timeout=7200):
        """获取工作流锁
        Args:
            timeout: 锁超时时间（秒），默认2小时
        Returns:
            bool: 是否成功获取锁
        """
        if self.lock_file.exists():
            # 检查锁是否过期
            lock_time = datetime.fromtimestamp(self.lock_file.stat().st_mtime)
            if (datetime.now() - lock_time).seconds < timeout:
                print(f"🔒 工作流锁仍然有效（已运行{int((datetime.now() - lock_time).seconds)}秒）")
                return False
            else:
                print(f"⚠️ 工作流锁已过期，自动释放")
                self.lock_file.unlink()

        # 创建锁文件
        try:
            self.lock_file.parent.mkdir(parents=True, exist_ok=True)
            self.lock_file.touch()
            print(f"🔓 工作流锁已获取: {self.lock_file}")
            return True
        except Exception as e:
            print(f"❌ 获取工作流锁失败: {e}")
            return False

    def release_lock(self):
        """释放工作流锁"""
        try:
            if self.lock_file.exists():
                self.lock_file.unlink()
                print(f"🔓 工作流锁已释放")
        except Exception as e:
            print(f"❌ 释放工作流锁失败: {e}")

    def is_lock_acquired(self):
        """检查锁是否已获取"""
        return self.lock_file.exists()


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="工作流协调器")
    parser.add_argument("--status", action="store_true", help="查看工作流状态")
    parser.add_argument("--next-stage", action="store_true", help="获取下一阶段")
    parser.add_argument("--complete", help="标记阶段完成", metavar="STAGE")
    parser.add_argument("--add-blocker", help="添加阻塞问题", metavar="BLOCKER")
    parser.add_argument("--remove-blocker", help="移除阻塞问题", metavar="BLOCKER")
    parser.add_argument("--auto-continue", action="store_true", help="检查是否应该自动继续")
    parser.add_argument("--acquire-lock", action="store_true", help="获取工作流锁")
    parser.add_argument("--release-lock", action="store_true", help="释放工作流锁")
    parser.add_argument("--check-lock", action="store_true", help="检查锁状态")

    args = parser.parse_args()

    coordinator = WorkflowCoordinator()

    if args.status:
        coordinator.print_workflow_summary()
    elif args.next_stage:
        next_stage = coordinator.get_current_stage()
        print(f"下一阶段: {next_stage}")
    elif args.complete:
        stage = args.complete
        coordinator.mark_stage_complete(stage)
    elif args.add_blocker:
        coordinator.add_blocker(args.add_blocker)
    elif args.remove_blocker:
        coordinator.remove_blocker(args.remove_blocker)
    elif args.auto_continue:
        should_continue = coordinator.should_auto_continue()
        print(f"是否自动继续: {should_continue}")
        sys.exit(0 if should_continue else 1)
    elif args.acquire_lock:
        success = coordinator.acquire_lock()
        sys.exit(0 if success else 1)
    elif args.release_lock:
        coordinator.release_lock()
    elif args.check_lock:
        is_locked = coordinator.is_lock_acquired()
        print(f"锁状态: {'🔒 已锁定' if is_locked else '🔓 未锁定'}")
        sys.exit(0 if not is_locked else 1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
