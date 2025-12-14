/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.User;
import entity.User_Status;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import model.HibernateUtil;
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

/**
 *
 * @author USER
 */
@MultipartConfig //aniw dnnone - nttn request.getParameter eke output - null nm dla na MpC
@WebServlet(name = "ChatSignUp", urlPatterns = {"/ChatSignUp"})
public class ChatSignUp extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //to read content thats being sent
        Gson gson = new Gson(); //create gson lib
        //JsonObject responseJson = new JsonObject(); //create java obj

        JsonObject responseJson = new JsonObject(); //create java obj 4
        responseJson.addProperty("success", false);

        //client side eken elyt dla server side ekt hmben JSOn txt ek JsonObject kyn java obj ekt map krgnnw
        //JsonObject requestJson = gson.fromJson(request.getReader(), JsonObject.class);//request eke ena   - MultipartConfig unma Json ba 
        //System.out.println(requestJson.get("message").getAsString());//ewn msg ek print kra 2
        String mobile = request.getParameter("mobile");
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String password = request.getParameter("password");
        Part avatarImage = request.getPart("avatarImage");//Part obj ekk wdyt image ek

        if (mobile.isEmpty()) { //isBlank - whitespace denneth na - hbai old server jdk nisa use krn ba
            //mobile number is empty
            responseJson.addProperty("message", "Please fill in your Mobile Number");
        } else if (!Validations.isMobileNumberValid(mobile)) {
            //invalid mobile number
            responseJson.addProperty("message", "Invalid Mobile Number");
        } else if (firstName.isEmpty()) {
            //firstName is empty
            responseJson.addProperty("message", "Please fill in your First Name");
        } else if (lastName.isEmpty()) {
            //lastName is empty
            responseJson.addProperty("message", "Please fill in your Last Name");
        } else if (password.isEmpty()) {
            //password is empty
            responseJson.addProperty("message", "Please add a Password");
        } else if (!Validations.isPasswordValid(password)) {
            //invalid password
            responseJson.addProperty("message", "Password  must include at least one Uppsercase letter, Number, Special Character and be atleast 8 character long");
        } else {//db ekt dna wade

            Session session = HibernateUtil.getSessionFactory().openSession();

            //search mobile
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.eq("mobile", mobile));//menna me mobile no ekt adla users la hoynna

            if (!criteria1.list().isEmpty()) {

                //mobile number found
                responseJson.addProperty("message", "Mobile number already used");

            } else {
                //mobile no not used - new user

                User user = new User();
                user.setFirst_name(firstName);
                user.setLast_name(lastName);
                user.setMobile(mobile);
                user.setPassword(password);
                user.setRegistered_date_time(new Date());

                //get user status 2 = offline
                User_Status user_Status = (User_Status) session.get(User_Status.class, 2);
                user.setUser_Status(user_Status);

                session.save(user);//okkotm klin user save - img gna psse
                session.beginTransaction().commit();

                if (avatarImage != null) {//img null nttn
                    //image Selected

                    String serverPath = request.getServletContext().getRealPath("");//build folder path ek gtta -server eke
                    String avatarImagePath = serverPath + File.separator + "AvatarImages" + File.separator + mobile + ".png";//hdpu folder ekt mobile.png wdyt img save krnw
                    //System.out.println(avatarImagePath);
                    File file = new File(avatarImagePath);
                    Files.copy(avatarImage.getInputStream(), file.toPath(), StandardCopyOption.REPLACE_EXISTING);

                }

                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "User Successfully Registered!");

            }

            session.close();

        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));//content sype ek set krl ek Json krl aye ywnwa

    }

}
