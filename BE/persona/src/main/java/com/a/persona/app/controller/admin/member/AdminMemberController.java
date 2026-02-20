package com.a.persona.app.controller.admin.member;

import com.a.persona.app.controller.admin.member.payload.AdminMemberRequest;
import com.a.persona.app.controller.admin.member.payload.AdminMemberResponse;
import com.a.persona.app.controller.admin.member.payload.AdminMemberStatusRequest;
import com.a.persona.app.model.member.service.AdminMemberService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="(관리자) 멤버 관리", description = "관리자가 사용할 수 있는 멤버 관리 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/admin/member", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    // 전체/ 단건 멤버 조회
    @GetMapping
    @Operation(summary = "멤버 조회", description = "멤버를 전체/단건 조회합니다.<br>" +
            "멤버의 id와 함께 요청할 경우, 해당하는 멤버 단건 조회도 가능합니다.")
    public ResponseEntity<CommonApiResponse<List<AdminMemberResponse>>> getMembers(
            @RequestBody AdminMemberRequest adminMemberRequest
            ){

        List<AdminMemberResponse> responses;

        if(adminMemberRequest.getId()==null){
            responses = adminMemberService.getAllMember().stream().map(
                    AdminMemberResponse::from
            ).toList();
        }else{
            responses = List.of(AdminMemberResponse.from(adminMemberService.getMember(adminMemberRequest.getId())));
        }
            return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // 멤버 밴 활성화 / 비활성화
    @PatchMapping
    @Operation(summary = "멤버 차단", description = "멤버를 차단하거나, 차단 해제 합니다.<br>" +
            "status에는 ACTIVE, BANNED 가 들어갑니다.")
    public ResponseEntity<CommonApiResponse<Void>> changeMemberStatus(
            @RequestBody AdminMemberStatusRequest adminMemberStatusRequest
        ) {
            adminMemberService.changeMemberStatus(adminMemberStatusRequest.getId(), adminMemberStatusRequest.getStatus());
            return ResponseEntity.ok(CommonApiResponse.noContent());

        }
}
