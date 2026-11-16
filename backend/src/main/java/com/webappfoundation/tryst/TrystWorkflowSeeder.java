package com.webappfoundation.tryst;

import com.webappfoundation.connector.builtin.EmailConnector;
import com.webappfoundation.connector.demo.DemoRefundConnector;
import com.webappfoundation.dto.WorkflowDto;
import com.webappfoundation.dto.WorkflowDto.BindingDto;
import com.webappfoundation.dto.WorkflowDto.StageDto;
import com.webappfoundation.model.RefundPolicy;
import com.webappfoundation.service.WorkflowService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/** TRYST's real processes: takeaway orders, table bookings, and live-music evenings. Idempotent. */
@Component
@Order(10)
public class TrystWorkflowSeeder {
    private final WorkflowService workflowService;

    public TrystWorkflowSeeder(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        workflowService.defineWorkflow(WorkflowDto.builder().code("takeaway").label("Takeaway order").staffRole("Kitchen").isDefault(true)
                .stages(number(List.of(
                        stage("PLACED", "Placed", b -> b.initial(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(5)),
                        stage("CONFIRMED", "Confirmed", b -> b.onPaidEntry(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(5)
                                .bindings(List.of(bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE)))),
                        stage("PREPARING", "In the kitchen", b -> b.cancellable(true).refundPolicy(RefundPolicy.PARTIAL).refundPercent(50).targetMinutes(20)),
                        stage("READY", "Ready at the counter", b -> b.refundPolicy(RefundPolicy.NONE).targetMinutes(30)
                                .bindings(List.of(bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)))),
                        stage("PICKED_UP", "Picked up", b -> b.terminal(true).refundPolicy(RefundPolicy.NONE)),
                        cancelled()))).build());

        workflowService.defineWorkflow(WorkflowDto.builder().code("table").label("Table booking").staffRole("Host")
                .stages(number(List.of(
                        stage("REQUESTED", "Requested", b -> b.initial(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(10)),
                        stage("CONFIRMED", "Table saved", b -> b.onPaidEntry(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(60)
                                .bindings(List.of(bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE)))),
                        stage("SEATED", "Seated", b -> b.refundPolicy(RefundPolicy.NONE).targetMinutes(120)),
                        stage("COMPLETED", "Thanks for coming", b -> b.terminal(true).refundPolicy(RefundPolicy.NONE)),
                        stage("NO_SHOW", "No-show", b -> b.terminal(true).refundPolicy(RefundPolicy.NONE)),
                        cancelled()))).build());

        workflowService.defineWorkflow(WorkflowDto.builder().code("gig").label("Live music evening").staffRole("Host")
                .stages(number(List.of(
                        stage("RESERVED", "Reserved", b -> b.initial(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(30)),
                        stage("CONFIRMED", "On the list", b -> b.onPaidEntry(true).cancellable(true).refundPolicy(RefundPolicy.FULL).targetMinutes(1440)
                                .bindings(List.of(bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)))),
                        stage("CHECKED_IN", "Checked in", b -> b.refundPolicy(RefundPolicy.NONE).targetMinutes(240)),
                        stage("ATTENDED", "Attended", b -> b.terminal(true).refundPolicy(RefundPolicy.NONE)),
                        cancelled()))).build());
    }

    private static StageDto cancelled() {
        return stage("CANCELLED", "Cancelled", b -> b.terminal(true).refundPolicy(RefundPolicy.NONE)
                .bindings(List.of(bind(DemoRefundConnector.ID, DemoRefundConnector.REFUND_ISSUE))));
    }

    private static StageDto stage(String code, String label, Consumer<StageDto.StageDtoBuilder> cfg) {
        StageDto.StageDtoBuilder b = StageDto.builder().code(code).label(label).bindings(new ArrayList<>());
        cfg.accept(b);
        return b.build();
    }

    private static BindingDto bind(String connectorId, String actionCode) {
        return BindingDto.builder().connectorId(connectorId).actionCode(actionCode).enabled(true).build();
    }

    private static List<StageDto> number(List<StageDto> stages) {
        List<StageDto> out = new ArrayList<>(stages);
        for (int i = 0; i < out.size(); i++) {
            out.get(i).setOrdinal(i);
            if (out.get(i).getBindings() != null) {
                for (int j = 0; j < out.get(i).getBindings().size(); j++) {
                    out.get(i).getBindings().get(j).setOrdinal(j);
                }
            }
        }
        return out;
    }
}
